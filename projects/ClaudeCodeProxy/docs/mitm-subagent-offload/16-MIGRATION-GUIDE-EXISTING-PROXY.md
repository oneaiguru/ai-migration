**Repo changes**

```
/services
  /api-gateway           (your current Node server)
  /mitm-subagent-offload (new: addon + run scripts)
 /logs
 /work
   /sub
   /zai
README.md  (points to 17-README-TOP.md)
```

**Action items**

* Move your existing `server.js`, `admin.sh`, `client-setup.sh`, `index.html` into `/services/api-gateway`.
* Add MITM addon under `/services/mitm-subagent-offload/addons/`.

---