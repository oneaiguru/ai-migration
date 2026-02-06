package io.github.saeeddev94.xray.service

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PublicIpv4RoutesTest {
    @Test
    fun publicRoutesIncludePublicAddresses() {
        val routes = publicRoutes()
        assertTrue(isAllowed("8.8.8.8", routes))
        assertTrue(isAllowed("1.1.1.1", routes))
    }

    @Test
    fun publicRoutesExcludePrivateAddresses() {
        val routes = publicRoutes()
        assertFalse(isAllowed("10.0.0.1", routes))
        assertFalse(isAllowed("192.168.1.1", routes))
        assertFalse(isAllowed("172.16.0.1", routes))
    }

    @Test
    fun publicRoutesExcludeReservedAddresses() {
        val routes = publicRoutes()
        assertFalse(isAllowed("127.0.0.1", routes))
        assertFalse(isAllowed("224.0.0.1", routes))
        assertFalse(isAllowed("100.64.0.1", routes))
    }

    @Suppress("UNCHECKED_CAST")
    private fun publicRoutes(): List<Pair<String, Int>> {
        val clazz = Class.forName("io.github.saeeddev94.xray.service.TProxyServiceKt")
        val getter = clazz.getDeclaredMethod("getPUBLIC_IPV4_ROUTES")
        getter.isAccessible = true
        return getter.invoke(null) as List<Pair<String, Int>>
    }

    private fun isAllowed(address: String, routes: List<Pair<String, Int>>): Boolean {
        val ip = ipv4ToLong(address)
        for (route in routes) {
            val base = ipv4ToLong(route.first)
            val prefix = route.second
            val mask = if (prefix == 0) 0L else (-1L shl (32 - prefix)) and MAX_IPV4
            if ((ip and mask) == (base and mask)) {
                return true
            }
        }
        return false
    }

    private fun ipv4ToLong(address: String): Long {
        val parts = address.split(".")
        require(parts.size == 4) { "Invalid IPv4 address: $address" }
        var result = 0L
        for (part in parts) {
            val octet = part.toLong()
            require(octet in 0..255) { "Invalid IPv4 address: $address" }
            result = (result shl 8) or (octet and 0xFF)
        }
        return result
    }

    private companion object {
        private const val MAX_IPV4: Long = 0xFFFF_FFFFL
    }
}
