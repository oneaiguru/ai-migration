package io.github.saeeddev94.xray.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.widget.Toast
import androidx.core.app.NotificationCompat
import io.github.saeeddev94.xray.BuildConfig
import io.github.saeeddev94.xray.R
import io.github.saeeddev94.xray.Settings
import io.github.saeeddev94.xray.activity.MainActivity
import io.github.saeeddev94.xray.database.Profile
import io.github.saeeddev94.xray.helper.FileHelper
import XrayCore.XrayCore
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import io.github.saeeddev94.xray.Xray
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.reflect.cast

class TProxyService : VpnService() {

    companion object {
        init {
            System.loadLibrary("hev-socks5-tunnel")
        }

        const val STATUS_VPN_SERVICE_ACTION_NAME = "${BuildConfig.APPLICATION_ID}.VpnStatus"
        const val STOP_VPN_SERVICE_ACTION_NAME = "${BuildConfig.APPLICATION_ID}.VpnStop"
        const val START_VPN_SERVICE_ACTION_NAME = "${BuildConfig.APPLICATION_ID}.VpnStart"
        private const val VPN_SERVICE_NOTIFICATION_ID = 1
        private const val OPEN_MAIN_ACTIVITY_ACTION_ID = 2
        private const val STOP_VPN_SERVICE_ACTION_ID = 3

        fun status(context: Context) = startCommand(context, STATUS_VPN_SERVICE_ACTION_NAME)
        fun stop(context: Context) = startCommand(context, STOP_VPN_SERVICE_ACTION_NAME)

        fun start(context: Context, check: Boolean = true): Intent? {
            val prepareIntent = if (check) prepare(context) else null
            if (prepareIntent != null) {
                Log.e(
                    "TProxyService",
                    "Can't start: VpnService#prepare(): needs user permission"
                )
                return prepareIntent
            }
            startCommand(context, START_VPN_SERVICE_ACTION_NAME, true)
            return null
        }

        private fun startCommand(context: Context, name: String, foreground: Boolean = false) {
            Intent(context, TProxyService::class.java).also {
                it.action = name
                if (foreground && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(it)
                } else {
                    context.startService(it)
                }
            }
        }
    }

    private val notificationManager by lazy { getSystemService(NotificationManager::class.java) }
    private val profileRepository by lazy { Xray::class.cast(application).profileRepository }
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val startStopMutex = Mutex()

    private var isRunning: Boolean = false
    private var tunDevice: ParcelFileDescriptor? = null

    private external fun TProxyStartService(configPath: String, fd: Int): Boolean
    private external fun TProxyStopService()
    private external fun TProxyGetStats(): LongArray

    override fun onCreate() {
        super.onCreate()
        Settings.sync(applicationContext)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        // Promote to foreground ASAP for start intents and sticky restarts
        if (action == null || action == START_VPN_SERVICE_ACTION_NAME) {
            startForeground(
                VPN_SERVICE_NOTIFICATION_ID,
                createNotification(Settings.tunName)
            )
        }

        scope.launch {
            when (action) {
                START_VPN_SERVICE_ACTION_NAME, null -> findProfileAndStart()
                STOP_VPN_SERVICE_ACTION_NAME -> stopVPN()
                STATUS_VPN_SERVICE_ACTION_NAME -> statusVPN()
            }
        }
        return START_STICKY
    }

    override fun onRevoke() {
        scope.launch { stopVPN() }
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    private suspend fun findProfileAndStart() {
        val profile = if (Settings.selectedProfile == 0L) {
            null
        } else {
            profileRepository.find(Settings.selectedProfile)
        }
        startVPN(profile)
    }

    private suspend fun startVPN(profile: Profile?) {
        startStopMutex.withLock {
            if (isRunning || tunDevice != null) {
                Log.w("TProxyService", "Start requested while VPN is already running; restarting tunnel")
                stopNativeAndCloseTun()
            }

            val name = profile?.name ?: Settings.tunName

            // Refresh foreground notification on the main thread with the resolved profile name
            withContext(Dispatchers.Main) {
                startForeground(
                    VPN_SERVICE_NOTIFICATION_ID,
                    createNotification(name)
                )
            }

            /** Start xray */
            var xrayStarted = false
            if (profile != null) {
                FileHelper.createOrUpdate(Settings.xrayConfig(applicationContext), profile.config)
                val datDir: String = applicationContext.filesDir.absolutePath
                val configPath: String = Settings.xrayConfig(applicationContext).absolutePath
                val error: String = XrayCore.start(datDir, configPath)
                if (error.isNotEmpty()) {
                    showToast(error)
                    stopSelf()
                    return@withLock
                }
                xrayStarted = true
            }

            /** Create Tun */
            val tun = Builder()
            val tunName = getString(R.string.appName)

            /** Basic tun config */
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) tun.setMetered(false)
            tun.setMtu(Settings.tunMtu)
            tun.setSession(tunName)

            /** IPv4 */
            tun.addAddress(Settings.tunAddress, Settings.tunPrefix)
            tun.addDnsServer(Settings.primaryDns)
            tun.addDnsServer(Settings.secondaryDns)

            /** Bypass LAN (IPv4) */
            if (Settings.bypassLan) {
                // Route only public IPv4 ranges; keep private/link-local on the local network
                tun.addPublicIpv4Routes()
            } else {
                tun.addRoute("0.0.0.0", 0)
            }

            /** IPv6 */
            if (Settings.enableIpV6) {
                tun.addAddress(Settings.tunAddressV6, Settings.tunPrefixV6)
                tun.addDnsServer(Settings.primaryDnsV6)
                tun.addDnsServer(Settings.secondaryDnsV6)

                if (Settings.bypassLan) {
                    // Route global unicast only; leave ULA/link-local/multicast off the tunnel
                    tun.addRoute("2000::", 3)
                } else {
                    tun.addRoute("::", 0)
                }
            }

            /** Apps Routing */
            val vpnPackageName = applicationContext.packageName
            if (Settings.appsRoutingMode) {
                tun.addDisallowedApplication(vpnPackageName)
            }
            Settings.appsRouting.split("\n").forEach {
                val packageName = it.trim()
                if (packageName.isBlank()) return@forEach
                // Never allowlist the VPN app itself to prevent tunnel loops
                if (packageName == vpnPackageName && !Settings.appsRoutingMode) {
                    Log.w("TProxyService", "Skipping VPN app itself in allowlist: $packageName")
                    return@forEach
                }
                try {
                    if (Settings.appsRoutingMode) tun.addDisallowedApplication(packageName)
                    else tun.addAllowedApplication(packageName)
                } catch (e: PackageManager.NameNotFoundException) {
                    Log.w("TProxyService", "Skipping unknown package in routing list: $packageName", e)
                }
            }

            /** Build tun device */
            tunDevice = tun.establish()

            /** Check tun device */
            if (tunDevice == null) {
                Log.e("TProxyService", "tun#establish failed")
                if (xrayStarted) {
                    XrayCore.stop()
                }
                stopSelf()
                return@withLock
            }

            /** Create, Update tun2socks config */
            val tun2socksConfig = arrayListOf(
                "tunnel:",
                "  name: $tunName",
                "  mtu: ${Settings.tunMtu}",
                "socks5:",
                "  address: ${Settings.socksAddress}",
                "  port: ${Settings.socksPort}",
            )
            if (
                Settings.socksUsername.trim().isNotEmpty() &&
                Settings.socksPassword.trim().isNotEmpty()
            ) {
                tun2socksConfig.add("  username: ${Settings.socksUsername}")
                tun2socksConfig.add("  password: ${Settings.socksPassword}")
            }
            tun2socksConfig.add(if (Settings.socksUdp) "  udp: udp" else "  udp: tcp")
            tun2socksConfig.add("")
            FileHelper.createOrUpdate(
                Settings.tun2socksConfig(applicationContext),
                tun2socksConfig.joinToString("\n")
            )

            /** Start tun2socks */
            val nativeStarted = TProxyStartService(
                Settings.tun2socksConfig(applicationContext).absolutePath,
                tunDevice!!.fd
            )
            if (!nativeStarted) {
                Log.e("TProxyService", "Native tunnel failed to start; closing tun fd")
                try {
                    tunDevice?.close()
                } catch (e: Exception) {
                    Log.w("TProxyService", "Failed to close tun fd after native start failure", e)
                } finally {
                    tunDevice = null
                }
                if (xrayStarted) {
                    XrayCore.stop()
                }
                stopSelf()
                return@withLock
            }

            /** Broadcast start event */
            showToast("Start VPN")
            isRunning = true
            Intent(START_VPN_SERVICE_ACTION_NAME).also {
                it.`package` = BuildConfig.APPLICATION_ID
                it.putExtra("profile", name)
                sendBroadcast(it)
            }
        }
    }

    private suspend fun stopVPN() {
        startStopMutex.withLock {
            showToast("Stop VPN")
            isRunning = false
            Intent(STOP_VPN_SERVICE_ACTION_NAME).also {
                it.`package` = BuildConfig.APPLICATION_ID
                sendBroadcast(it)
            }

            // JNI stop can block; run on IO dispatcher via scope
            withContext(Dispatchers.IO) {
                stopNativeAndCloseTun()
            }

            withContext(Dispatchers.Main) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    stopForeground(STOP_FOREGROUND_REMOVE)
                } else {
                    @Suppress("DEPRECATION")
                    stopForeground(true)
                }
                stopSelf()
            }
        }
    }

    private fun statusVPN() {
        Intent(STATUS_VPN_SERVICE_ACTION_NAME).also {
            it.`package` = BuildConfig.APPLICATION_ID
            it.putExtra("isRunning", isRunning)
            sendBroadcast(it)
        }
    }

    private fun stopNativeAndCloseTun() {
        try {
            TProxyStopService()
        } catch (e: Exception) {
            Log.w("TProxyService", "Failed to stop native tunnel before restart", e)
        }

        try {
            XrayCore.stop()
        } catch (e: Exception) {
            Log.w("TProxyService", "Failed to stop Xray before restart", e)
        }

        try {
            tunDevice?.close()
        } catch (e: Exception) {
            Log.w("TProxyService", "Failed to close tun fd", e)
        } finally {
            tunDevice = null
        }

        isRunning = false
    }

    private fun createNotification(name: String): Notification {
        val pendingActivity = PendingIntent.getActivity(
            applicationContext,
            OPEN_MAIN_ACTIVITY_ACTION_ID,
            Intent(applicationContext, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        val pendingStop = PendingIntent.getService(
            applicationContext,
            STOP_VPN_SERVICE_ACTION_ID,
            Intent(applicationContext, TProxyService::class.java).also {
                it.action = STOP_VPN_SERVICE_ACTION_NAME
            },
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat
            .Builder(applicationContext, createNotificationChannel())
            .setSmallIcon(R.drawable.baseline_vpn_lock)
            .setContentTitle(name)
            .setContentIntent(pendingActivity)
            .addAction(0, getString(R.string.vpnStop), pendingStop)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel(): String {
        val id = "XrayVpnServiceNotification"
        val name = "Xray VPN Service"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(id, name, NotificationManager.IMPORTANCE_LOW)
            notificationManager.createNotificationChannel(channel)
        }
        return id
    }

    private fun showToast(message: String) {
        Handler(Looper.getMainLooper()).post {
            Toast.makeText(applicationContext, message, Toast.LENGTH_SHORT).show()
        }
    }

}

private val PUBLIC_IPV4_ROUTES: List<Pair<String, Int>> by lazy {
    buildPublicIpv4Cidrs(
        listOf(
            "0.0.0.0/8", // current network
            "10.0.0.0/8",
            "100.64.0.0/10", // CGNAT
            "127.0.0.0/8", // loopback
            "172.16.0.0/12",
            "169.254.0.0/16", // link-local
            "192.0.0.0/24", // IETF protocol assignments
            "192.0.2.0/24", // TEST-NET-1
            "192.88.99.0/24", // 6to4 relay
            "192.168.0.0/16",
            "198.18.0.0/15", // benchmarking
            "198.51.100.0/24", // TEST-NET-2
            "203.0.113.0/24", // TEST-NET-3
            "224.0.0.0/4", // multicast
            "240.0.0.0/4" // reserved/future use
        )
    )
}

private fun VpnService.Builder.addPublicIpv4Routes() {
    PUBLIC_IPV4_ROUTES.forEach { (address, prefix) ->
        addRoute(address, prefix)
    }
}

private fun buildPublicIpv4Cidrs(excludedCidrs: List<String>): List<Pair<String, Int>> {
    val mergedExcluded = excludedCidrs
        .map(::cidrToInterval)
        .sortedBy { it.start }
        .fold(mutableListOf<Ipv4Interval>()) { acc, interval ->
            val last = acc.lastOrNull()
            if (last == null || interval.start > last.end + 1) {
                acc.add(interval)
            } else if (interval.end > last.end) {
                acc[acc.lastIndex] = last.copy(end = interval.end)
            }
            acc
        }

    if (mergedExcluded.isEmpty()) {
        return listOf("0.0.0.0" to 0)
    }

    val allowed = mutableListOf<Ipv4Interval>()
    var cursor = 0L
    for (blocked in mergedExcluded) {
        if (cursor < blocked.start) {
            allowed.add(Ipv4Interval(cursor, blocked.start - 1))
        }
        cursor = blocked.end + 1
    }
    if (cursor <= MAX_IPV4) {
        allowed.add(Ipv4Interval(cursor, MAX_IPV4))
    }

    return allowed.flatMap { it.toCidrs() }
}

private fun cidrToInterval(cidr: String): Ipv4Interval {
    val (address, prefixText) = cidr.split("/")
    val prefix = prefixText.toInt()
    require(prefix in 0..32) { "Invalid prefix in CIDR: $cidr" }

    val base = ipv4ToLong(address)
    val mask = if (prefix == 0) 0L else (-1L shl (32 - prefix)) and MAX_IPV4
    val invertedMask = mask.inv() and MAX_IPV4
    val start = base and mask
    val end = start or invertedMask
    return Ipv4Interval(start, end)
}

private fun Ipv4Interval.toCidrs(): List<Pair<String, Int>> {
    val cidrs = mutableListOf<Pair<String, Int>>()
    var start = this.start
    while (start <= end) {
        var block = if (start == 0L) 1L shl 32 else start and -start
        val remaining = end - start + 1
        while (block > remaining) {
            block = block shr 1
        }
        val prefix = 32 - java.lang.Long.numberOfTrailingZeros(block)
        cidrs.add(longToIpv4(start) to prefix.toInt())
        start += block
    }
    return cidrs
}

private fun ipv4ToLong(address: String): Long {
    val parts = address.split(".")
    require(parts.size == 4) { "Invalid IPv4 address: $address" }
    var result = 0L
    parts.forEach { part ->
        val octet = part.toLong()
        require(octet in 0..255) { "Invalid IPv4 address: $address" }
        result = (result shl 8) or (octet and 0xFF)
    }
    return result
}

private fun longToIpv4(value: Long): String =
    listOf(
        (value shr 24) and 0xFF,
        (value shr 16) and 0xFF,
        (value shr 8) and 0xFF,
        value and 0xFF
    ).joinToString(".") { it.toString() }

private const val MAX_IPV4: Long = 0xFFFF_FFFFL

private data class Ipv4Interval(val start: Long, val end: Long)
