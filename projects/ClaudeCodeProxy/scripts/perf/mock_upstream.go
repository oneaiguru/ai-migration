package main

import (
    "encoding/json"
    "fmt"
    "log"
    "math/rand"
    "net/http"
    "time"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/v1/messages", func(w http.ResponseWriter, r *http.Request){
        // Decide stream vs json based on body 'stream': true
        var body map[string]any
        json.NewDecoder(r.Body).Decode(&body)
        stream := false
        if v, ok := body["stream"]; ok {
            if b, ok := v.(bool); ok { stream = b }
        }
        if stream {
            w.Header().Set("content-type", "text/event-stream")
            fl, _ := w.(http.Flusher)
            for i:=0; i<20; i++ {
                fmt.Fprintf(w, "data: {\"delta\":\"word-%d\"}\n\n", i)
                if fl != nil { fl.Flush() }
                time.Sleep(time.Duration(10+rand.Intn(20)) * time.Millisecond)
            }
            return
        }
        // JSON response with tiny usage
        w.Header().Set("content-type", "application/json")
        time.Sleep(time.Duration(5+rand.Intn(15)) * time.Millisecond)
        resp := map[string]any{
            "id": "mock",
            "content": []any{"ok"},
            "usage": map[string]any{"input_tokens": 5, "output_tokens": 10},
        }
        json.NewEncoder(w).Encode(resp)
    })
    srv := &http.Server{Addr: ":9090", Handler: mux}
    log.Println("mock upstream on :9090")
    log.Fatal(srv.ListenAndServe())
}

