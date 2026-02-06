# Codex Review Feedback for PR #146

## projects/xrayandroid-vpn/android/service/VpnTileService.kt:80
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Update tile state after toggling VPN**

The tile’s click handler decides between `start()` and `stop()` based on `qsTile.state`, but the only place that updates the tile state/label is `handleUpdate()`, which relies on extras written in `onStartCommand`. In this package, nothing sends those extras or updates the shared prefs when the VPN starts/stops (TProxyService only broadcasts), so the tile state never flips after a user tap. That leaves the tile stuck in its initial state (typically inactive), causing repeated taps to keep restarting the VPN and never stop it. Consider updating the tile state directly after `start()/stop()` or listening to the TProxyService broadcasts to refresh state.

Useful? React with 👍 / 👎.

## (no path):-

### 💡 Codex Review

Here are some automated review suggestions for this pull request.

**Reviewed commit:** `73b573e028`
    

<details> <summary>ℹ️ About Codex in GitHub</summary>
<br/>

[Your team has set up Codex to review pull requests in this repo](http://chatgpt.com/codex/settings/general). Reviews are triggered when you
- Open a pull request for review
- Mark a draft as ready
- Comment "@codex review".

If Codex has suggestions, it will comment; otherwise it will react with 👍.




Codex can also answer questions or update the PR. Try commenting "@codex address that feedback".
            
</details>

## projects/xrayandroid-vpn/android/service/VpnTileService.kt:-
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Avoid marking the tile active before VPN actually starts**

The tile is updated to ACTIVE immediately after calling `TProxyService.start(...)` with no check that the VPN actually started. `TProxyService.start()` can return early when `VpnService.prepare()` indicates permission is still required, and the service can also fail to start later (e.g., tun establishment or native start failure) without sending a START broadcast. In those cases the QS tile will display “active” even though the VPN isn’t running, and it won’t self-correct until a later status update. Consider updating the tile only after receiving the START/STATUS broadcast, or explicitly handling the permission-failed path before calling `updateFromAction`.

Useful? React with 👍 / 👎.

## (no path):-

### 💡 Codex Review

Here are some automated review suggestions for this pull request.

**Reviewed commit:** `451de719b4`
    

<details> <summary>ℹ️ About Codex in GitHub</summary>
<br/>

[Your team has set up Codex to review pull requests in this repo](http://chatgpt.com/codex/settings/general). Reviews are triggered when you
- Open a pull request for review
- Mark a draft as ready
- Comment "@codex review".

If Codex has suggestions, it will comment; otherwise it will react with 👍.




Codex can also answer questions or update the PR. Try commenting "@codex address that feedback".
            
</details>

## projects/xrayandroid-vpn/android/activity/TProxyService.kt:205
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Prevent allowlisting the VPN app itself**

When `Settings.appsRoutingMode` is false (allowlist mode), the code only allows packages from `Settings.appsRouting` and does not unconditionally exclude the VPN package. Because the selection UI lists all launchable apps, the VPN app itself can be selected, which routes Xray/tun2socks sockets back through the VPN and can create a tunnel loop or break connectivity. Consider always disallowing `applicationContext.packageName` (or filtering it out of the selection list / protecting sockets) regardless of routing mode; the issue only surfaces when the app is included in the allowlist.

Useful? React with 👍 / 👎.

## (no path):-

### 💡 Codex Review

Here are some automated review suggestions for this pull request.

**Reviewed commit:** `4ae95b0810`
    

<details> <summary>ℹ️ About Codex in GitHub</summary>
<br/>

[Your team has set up Codex to review pull requests in this repo](http://chatgpt.com/codex/settings/general). Reviews are triggered when you
- Open a pull request for review
- Mark a draft as ready
- Comment "@codex review".

If Codex has suggestions, it will comment; otherwise it will react with 👍.




Codex can also answer questions or update the PR. Try commenting "@codex address that feedback".
            
</details>

## projects/xrayandroid-vpn/android/activity/TProxyService.kt:59
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Surface VPN permission request instead of silently returning**

If the user hasn’t granted VPN permission (or it was revoked), `start()` returns immediately after logging, which means callers like the quick‑settings tile will do nothing and provide no way to approve the permission. This leaves first‑time users unable to start the VPN from the tile. Consider returning the `VpnService.prepare()` intent to the caller or triggering a permission flow (e.g., via an activity or `startActivityAndCollapse`) so the user can grant access when needed.

Useful? React with 👍 / 👎.

## projects/xrayandroid-vpn/android/service/VpnTileService.kt:130
**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Add receiver export flag for Android 13+**

On Android 13+ (targetSdkVersion 33+), `registerReceiver()` without an explicit export flag throws an `IllegalArgumentException`, which will crash the tile service when it starts listening. Add `Context.RECEIVER_NOT_EXPORTED` (or `RECEIVER_EXPORTED` if you truly intend it) to keep the dynamic receiver working on modern targets.

Useful? React with 👍 / 👎.

## (no path):-

### 💡 Codex Review

Here are some automated review suggestions for this pull request.

**Reviewed commit:** `e35c30cbf1`
    

<details> <summary>ℹ️ About Codex in GitHub</summary>
<br/>

[Your team has set up Codex to review pull requests in this repo](http://chatgpt.com/codex/settings/general). Reviews are triggered when you
- Open a pull request for review
- Mark a draft as ready
- Comment "@codex review".

If Codex has suggestions, it will comment; otherwise it will react with 👍.




Codex can also answer questions or update the PR. Try commenting "@codex address that feedback".
            
</details>
