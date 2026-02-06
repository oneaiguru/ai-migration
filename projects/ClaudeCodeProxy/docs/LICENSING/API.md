````md
# Licensing API (Issuer)

## POST /v1/license/issue
Request:
```json
{"invite_code":"DEV-TRIAL-7D","email":"user@example.com","device":"hostname-optional"}
````

Response:

```json
{"license":{...},"signature":"BASE64","license_pack":"{\"license\":{...},\"signature\":\"...\"}","kid":"main-2025-10","plan":"trial","features":["zai_offload"],"exp":1761782400}
```

## POST /v1/device/begin

Request:

```json
{"invite_code":"DEV-TRIAL-7D","email":"user@example.com","device":"hostname","redirect_url":"http://127.0.0.1:%PORT%/callback?code=%s"}
```

Response:

```json
{"user_code":"AB-CD-EF-GH","poll_token":"...","authorize_url":"https://example/activate?code=AB-CD-EF-GH","interval":2,"expires_in":300}
```

## POST /v1/device/poll

Request:

```json
{"poll_token":"..."}
```

Response:

* Pending: `{"status":"pending"}`
* OK: `{"status":"ok","license_pack":"{...}"}`
* Expired/Not found

````