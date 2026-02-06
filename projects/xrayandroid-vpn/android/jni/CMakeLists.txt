# Resolve Android libs for this module
find_library(log_lib log)
find_library(android_lib android)

if (NOT log_lib OR NOT android_lib)
    message(FATAL_ERROR "Missing required Android platform libraries: log=${log_lib} android=${android_lib}")
endif ()

# Add JNI bridge for hev-socks5-tunnel (adjust path if you embed elsewhere)
add_library(
        hev-socks5-tunnel
        SHARED
        hev_socks5_tunnel.cpp)

# Locate the prebuilt hev-socks5-tunnel core shared library to satisfy the
# extern symbols declared in hev_socks5_tunnel.cpp. Override HEV_TUNNEL_CORE_DIR
# if you store the .so elsewhere.
set(HEV_TUNNEL_CORE_HINTS
        ${CMAKE_CURRENT_SOURCE_DIR}/../jniLibs
        ${CMAKE_CURRENT_SOURCE_DIR}/src/main/jniLibs
        ${CMAKE_CURRENT_SOURCE_DIR}/../app/src/main/jniLibs
        ${HEV_TUNNEL_CORE_DIR}
        $ENV{HEV_TUNNEL_CORE_DIR})

find_library(hev_tunnel_core_lib
        NAMES hev-socks5-tunnel-core
        PATHS ${HEV_TUNNEL_CORE_HINTS}
        PATH_SUFFIXES ${ANDROID_ABI})

if (NOT hev_tunnel_core_lib)
    message(FATAL_ERROR "Missing hev-socks5-tunnel core library. Place libhev-socks5-tunnel-core.so under one of: ${HEV_TUNNEL_CORE_HINTS} (in an ${ANDROID_ABI} subfolder) or set HEV_TUNNEL_CORE_DIR to the directory containing the prebuilt .so.")
endif ()

# Link libraries for hev-socks5-tunnel
target_link_libraries(
        hev-socks5-tunnel
        ${hev_tunnel_core_lib}
        ${log_lib}
        ${android_lib})
