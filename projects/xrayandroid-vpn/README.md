XrayAndroid VPN implementation assets migrated from `/Users/m/git/clients/xrayandroid` and `/Users/m/git/clients/xrayandroid-essential`. This folder holds the working VPN pieces to reuse in a new universal product without the rest of the Android project scaffolding.

What's included
- Kotlin services/activities from `vpn_implementation_package` (`android/activity/TProxyService.kt`, `android/activity/AppSelectionActivity.kt`) plus the quick settings tile from `latest/VpnTileService.kt`.
- JNI bridge for hev-socks5-tunnel (`android/jni/hev_socks5_tunnel.cpp`) and a CMake snippet to link it.
- UI layouts and base resources for the app-selection flow (`android/layout/*`, `android/res/values/*`, `android/res/drawable/ic_vpn_notification.xml`).
- Test stub for the JNI bridge (`android/tests/HevSocks5TunnelJniTest.java`).
- Config template for tun2socks (`android/config/tunnel_config_template.yaml`).
- Integration docs (`docs/INTEGRATION_GUIDE.md`) and the original package overview (`docs/VPN_PACKAGE_README.md`).

Integration notes
- Keep package names intact (`io.github.saeeddev94.xray.*`) when dropping files into an Android module (for example under `app/src/main/java` and `app/src/main/jni`).
- The services expect host app classes and config helpers not included here: `Settings`, `FileHelper`, `Profile`, `Xray` application, `XrayCore`, and `BuildConfig`. Wire these to your existing Xray core integration.
- Common resources are included (notification icon, public IP bypass array, quick settings tile icons, VPN strings). Adjust styling to match your app theme as needed.
- The JNI bridge must link against the native hev-socks5-tunnel library for your target ABIs. Use `android/jni/CMakeLists.txt` as a starting point and include the compiled `.so` artifacts (ensure `log-lib` is defined via `find_library(log-lib log)`).
- See `docs/INTEGRATION_GUIDE.md` for the end-to-end packet flow and setup, and use `android/config/tunnel_config_template.yaml` when generating the tun2socks config at runtime.
