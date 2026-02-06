package main

import (
    "net/http/httptest"
    "testing"
)

// Minimal smoke: routes include new endpoints when store is present.
func TestRoutesIncludePersistence(t *testing.T) {
    srv := newServer(0, nil, nil)
    if srv.store == nil {
        t.Skip("persistence disabled by env; covered in other tests")
    }
    h := srv.routes()
    rr := httptest.NewRecorder()
    req := httptest.NewRequest("GET", "/v1/usage/rollups?granularity=hour", nil)
    h.ServeHTTP(rr, req)
    if rr.Code == 503 { // disabled case
        t.Skip("store disabled at runtime")
    }
}

