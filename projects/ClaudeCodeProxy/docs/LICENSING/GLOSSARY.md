# Glossary (Licensing)

- **Device-code flow**: An OAuth-style flow where the CLI shows a code and the user authorizes in a browser; CLI polls until granted.
- **Loopback flow**: The CLI starts a localhost listener to capture the browser redirect automatically.
- **Pack**: The license bundle we verify locally (`{"license":{...},"signature":"..."}`).
- **KID**: Key ID used to select the public key for verification.
- **LKG**: Last-known-good; the most recent verified pack cached locally.
