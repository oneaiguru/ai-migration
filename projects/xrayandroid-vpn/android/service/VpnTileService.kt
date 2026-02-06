package io.github.saeeddev94.xray.service

import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.SharedPreferences
import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import io.github.saeeddev94.xray.R

class VpnTileService : TileService() {

    private var receiverRegistered = false
    private val vpnStatusReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val action = intent?.action ?: return
            when (action) {
                TProxyService.START_VPN_SERVICE_ACTION_NAME -> {
                    val label = intent.getStringExtra("profile") ?: defaultLabel()
                    updateFromAction(action, label)
                }
                TProxyService.STOP_VPN_SERVICE_ACTION_NAME -> {
                    updateFromAction(action, defaultLabel())
                }
                TProxyService.STATUS_VPN_SERVICE_ACTION_NAME -> {
                    val isRunning = intent.getBooleanExtra("isRunning", false)
                    val label = if (isRunning) {
                        sharedPref().getString("label", defaultLabel()) ?: defaultLabel()
                    } else {
                        defaultLabel()
                    }
                    val statusAction = if (isRunning) {
                        TProxyService.START_VPN_SERVICE_ACTION_NAME
                    } else {
                        TProxyService.STOP_VPN_SERVICE_ACTION_NAME
                    }
                    updateFromAction(statusAction, label)
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        requestListeningState(this, ComponentName(this, VpnTileService::class.java))
        val action = intent?.getStringExtra("action") ?: ""
        val label = intent?.getStringExtra("label") ?: ""
        val sharedPref = sharedPref()
        sharedPref.edit()
            .putString("action", action)
            .putString("label", label)
            .apply()
        handleUpdate(action, label)
        return START_STICKY
    }

    override fun onStartListening() {
        super.onStartListening()
        registerReceiverIfNeeded()
        TProxyService.status(applicationContext)
        handleUpdate()
    }

    override fun onStopListening() {
        unregisterReceiverIfNeeded()
        super.onStopListening()
    }

    override fun onClick() {
        super.onClick()
        registerReceiverIfNeeded()
        when (qsTile?.state) {
            Tile.STATE_INACTIVE -> {
                val prepareIntent = TProxyService.start(applicationContext)
                if (prepareIntent != null) {
                    // VPN permission required - launch the permission dialog
                    startActivityAndCollapse(prepareIntent)
                }
            }
            Tile.STATE_ACTIVE -> TProxyService.stop(applicationContext)
        }
        // Tile state updates via broadcast receiver for both start and stop to ensure
        // state matches actual VPN service status (success/failure)
    }

    private fun handleUpdate(newAction: String? = null, newLabel: String? = null) {
        val sharedPref = sharedPref()
        val action = newAction ?: sharedPref.getString("action", "")!!
        val label = newLabel ?: sharedPref.getString("label", "")!!
        if (action.isNotEmpty() && label.isNotEmpty()) {
            when (action) {
                TProxyService.START_VPN_SERVICE_ACTION_NAME -> updateTile(Tile.STATE_ACTIVE, label)
                TProxyService.STOP_VPN_SERVICE_ACTION_NAME -> updateTile(Tile.STATE_INACTIVE, label)
            }
        }
    }

    private fun updateFromAction(action: String, label: String) {
        sharedPref().edit()
            .putString("action", action)
            .putString("label", label)
            .apply()
        handleUpdate(action, label)
    }

    private fun updateTile(newState: Int, newLabel: String) {
        val tile = qsTile ?: return
        tile.apply {
            state = newState
            label = newLabel
            icon = Icon.createWithResource(applicationContext, R.drawable.vpn_key)
            updateTile()
        }
    }

    private fun defaultLabel(): String {
        return getString(R.string.appName)
    }

    private fun sharedPref(): SharedPreferences {
        return getSharedPreferences("vpn_tile", Context.MODE_PRIVATE)
    }

    private fun registerReceiverIfNeeded() {
        if (receiverRegistered) {
            return
        }
        val filter = IntentFilter().apply {
            addAction(TProxyService.START_VPN_SERVICE_ACTION_NAME)
            addAction(TProxyService.STOP_VPN_SERVICE_ACTION_NAME)
            addAction(TProxyService.STATUS_VPN_SERVICE_ACTION_NAME)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(vpnStatusReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(vpnStatusReceiver, filter)
        }
        receiverRegistered = true
    }

    private fun unregisterReceiverIfNeeded() {
        if (!receiverRegistered) {
            return
        }
        unregisterReceiver(vpnStatusReceiver)
        receiverRegistered = false
    }

}
