package main

import (
	"bufio"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type requestKey struct {
	lane   string
	op     string
	status string
}

type latencyKey struct {
	lane string
	op   string
}

type latencyHistogram struct {
	buckets []float64
	counts  []int64
	sum     float64
	total   int64
}

type speedKey struct {
	lane  string
	model string
}

type rerouteKey struct {
	mode  string
	model string
}

type tokenAgg struct {
	inTokens      int64
	outTokens     int64
	dirtySeconds  float64
	streamSeconds float64
}

type metrics struct {
    mu        sync.Mutex
    reqTotal  map[requestKey]int64
    latency   map[latencyKey]*latencyHistogram
    partials  int64
    upstream  map[string]float64
    speed     map[speedKey]*tokenAgg
    preferred map[speedKey]int64
    rerouted  map[rerouteKey]int64
    wastedMs  map[string]int64
    startTime time.Time

    // R4 persistence metrics
    storeWrites       int64
    storeWriteErrors  int64
    rollupLatency     map[string]*latencyHistogram // by granularity: hour/day
    storeSizeBytes    int64
}

func newMetrics() *metrics {
    return &metrics{
        reqTotal:  make(map[requestKey]int64),
        latency:   make(map[latencyKey]*latencyHistogram),
        upstream:  make(map[string]float64),
        speed:     make(map[speedKey]*tokenAgg),
        preferred: make(map[speedKey]int64),
        rerouted:  make(map[rerouteKey]int64),
        wastedMs:  make(map[string]int64),
        startTime: time.Now(),
        rollupLatency: make(map[string]*latencyHistogram),
    }
}

func (m *metrics) observeRequest(lane, op string, status int, latency time.Duration, model string, inTokens, outTokens int, dirty, stream time.Duration) {
	if m == nil {
		return
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	key := requestKey{lane: lane, op: op, status: strconv.Itoa(status)}
	m.reqTotal[key]++

	histKey := latencyKey{lane: lane, op: op}
	hist, ok := m.latency[histKey]
	if !ok {
		buckets := []float64{0.1, 0.25, 0.5, 1, 2, 5, 10, 30}
		hist = &latencyHistogram{buckets: buckets, counts: make([]int64, len(buckets))}
		m.latency[histKey] = hist
	}
	seconds := latency.Seconds()
	hist.sum += seconds
	hist.total++
	for i, upper := range hist.buckets {
		if seconds <= upper {
			hist.counts[i]++
			break
		}
		if i == len(hist.buckets)-1 {
			hist.counts[i]++
		}

		key := speedKey{lane: lane, model: model}
		agg, ok := m.speed[key]
		if !ok {
			agg = &tokenAgg{}
			m.speed[key] = agg
		}
		agg.inTokens += int64(inTokens)
		agg.outTokens += int64(outTokens)
		agg.dirtySeconds += dirty.Seconds()
		if stream.Seconds() > 0 {
			agg.streamSeconds += stream.Seconds()
		} else {
			agg.streamSeconds += dirty.Seconds()
		}
	}
}

func (m *metrics) observePreferredAttempt(lane, model string) {
	if m == nil {
		return
	}
	m.mu.Lock()
	key := speedKey{lane: lane, model: model}
	m.preferred[key]++
	m.mu.Unlock()
}

func (m *metrics) observeReroute(mode, model string) {
	if m == nil {
		return
	}
	m.mu.Lock()
	key := rerouteKey{mode: mode, model: model}
	m.rerouted[key]++
	m.mu.Unlock()
}

func (m *metrics) addWastedRetry(model string, ms int) {
	if m == nil || ms <= 0 {
		return
	}
	m.mu.Lock()
	m.wastedMs[model] += int64(ms)
	m.mu.Unlock()
}

func (m *metrics) bumpPartial() {
	if m == nil {
		return
	}
	m.mu.Lock()
	m.partials++
	m.mu.Unlock()
}

func (m *metrics) setUpstream(lane string, ready bool) {
	if m == nil {
		return
	}
	m.mu.Lock()
	if ready {
		m.upstream[lane] = 1
	} else {
		m.upstream[lane] = 0
	}
	m.mu.Unlock()
}

func (m *metrics) handler() http.Handler {
	if m == nil {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte("metrics unavailable"))
		})
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		m.mu.Lock()
		defer m.mu.Unlock()

		w.Header().Set("content-type", "text/plain; version=0.0.4")
		buf := bufio.NewWriter(w)
		defer buf.Flush()

		fmt.Fprintln(buf, "# HELP ccp_requests_total Number of requests handled by lane/op/status")
		fmt.Fprintln(buf, "# TYPE ccp_requests_total counter")
		for key, value := range m.reqTotal {
			fmt.Fprintf(buf, "ccp_requests_total{lane=\"%s\",op=\"%s\",status=\"%s\"} %d\n", key.lane, key.op, key.status, value)
		}

		fmt.Fprintln(buf, "# HELP ccp_request_duration_seconds Proxy request latency in seconds")
		fmt.Fprintln(buf, "# TYPE ccp_request_duration_seconds histogram")
		for key, hist := range m.latency {
			var cumulative int64
			for i, upper := range hist.buckets {
				cumulative += hist.counts[i]
				fmt.Fprintf(buf, "ccp_request_duration_seconds_bucket{lane=\"%s\",op=\"%s\",le=\"%g\"} %d\n", key.lane, key.op, upper, cumulative)
			}
			fmt.Fprintf(buf, "ccp_request_duration_seconds_bucket{lane=\"%s\",op=\"%s\",le=\"+Inf\"} %d\n", key.lane, key.op, hist.total)
			fmt.Fprintf(buf, "ccp_request_duration_seconds_sum{lane=\"%s\",op=\"%s\"} %f\n", key.lane, key.op, hist.sum)
			fmt.Fprintf(buf, "ccp_request_duration_seconds_count{lane=\"%s\",op=\"%s\"} %d\n", key.lane, key.op, hist.total)
		}

		fmt.Fprintln(buf, "# HELP ccp_partial_writes_total Number of partial output files created")
		fmt.Fprintln(buf, "# TYPE ccp_partial_writes_total counter")
		fmt.Fprintf(buf, "ccp_partial_writes_total %d\n", m.partials)

		fmt.Fprintln(buf, "# HELP ccp_upstream_ready Upstream readiness (1 ready, 0 unavailable)")
		fmt.Fprintln(buf, "# TYPE ccp_upstream_ready gauge")
		for lane, value := range m.upstream {
			fmt.Fprintf(buf, "ccp_upstream_ready{lane=\"%s\"} %g\n", lane, value)
		}

		if len(m.speed) > 0 {
			fmt.Fprintln(buf, "# HELP ccp_output_tokens_total Total output tokens observed per lane/model")
			fmt.Fprintln(buf, "# TYPE ccp_output_tokens_total counter")
			for key, agg := range m.speed {
				fmt.Fprintf(buf, "ccp_output_tokens_total{lane=\"%s\",model=\"%s\"} %d\n", key.lane, key.model, agg.outTokens)
			}

			fmt.Fprintln(buf, "# HELP ccp_input_tokens_total Total input tokens observed per lane/model")
			fmt.Fprintln(buf, "# TYPE ccp_input_tokens_total counter")
			for key, agg := range m.speed {
				fmt.Fprintf(buf, "ccp_input_tokens_total{lane=\"%s\",model=\"%s\"} %d\n", key.lane, key.model, agg.inTokens)
			}

			fmt.Fprintln(buf, "# HELP ccp_stream_seconds_total Total streaming seconds captured per lane/model")
			fmt.Fprintln(buf, "# TYPE ccp_stream_seconds_total counter")
			for key, agg := range m.speed {
				fmt.Fprintf(buf, "ccp_stream_seconds_total{lane=\"%s\",model=\"%s\"} %f\n", key.lane, key.model, agg.streamSeconds)
			}

			fmt.Fprintln(buf, "# HELP ccp_dirty_seconds_total Total wall-clock seconds per lane/model")
			fmt.Fprintln(buf, "# TYPE ccp_dirty_seconds_total counter")
			for key, agg := range m.speed {
				fmt.Fprintf(buf, "ccp_dirty_seconds_total{lane=\"%s\",model=\"%s\"} %f\n", key.lane, key.model, agg.dirtySeconds)
			}
		}

		if len(m.preferred) > 0 {
			fmt.Fprintln(buf, "# HELP ccp_preferred_attempt_total Attempts on preferred lane under quota pressure")
			fmt.Fprintln(buf, "# TYPE ccp_preferred_attempt_total counter")
			for key, value := range m.preferred {
				fmt.Fprintf(buf, "ccp_preferred_attempt_total{lane=\"%s\",model=\"%s\"} %d\n", key.lane, key.model, value)
			}
		}

		if len(m.rerouted) > 0 {
			fmt.Fprintln(buf, "# HELP ccp_rerouted_on_limit_total Reroutes triggered by quota decisions")
			fmt.Fprintln(buf, "# TYPE ccp_rerouted_on_limit_total counter")
			for key, value := range m.rerouted {
				fmt.Fprintf(buf, "ccp_rerouted_on_limit_total{mode=\"%s\",model=\"%s\"} %d\n", key.mode, key.model, value)
			}
		}

        if len(m.wastedMs) > 0 {
            fmt.Fprintln(buf, "# HELP ccp_wasted_retry_ms_total Milliseconds spent on failed quota attempts before reroute")
            fmt.Fprintln(buf, "# TYPE ccp_wasted_retry_ms_total counter")
            for model, value := range m.wastedMs {
                fmt.Fprintf(buf, "ccp_wasted_retry_ms_total{model=\"%s\"} %d\n", model, value)
            }
        }

        // R4 persistence metrics
        fmt.Fprintln(buf, "# HELP ccp_store_writes_total Total samples written to the store")
        fmt.Fprintln(buf, "# TYPE ccp_store_writes_total counter")
        fmt.Fprintf(buf, "ccp_store_writes_total %d\n", m.storeWrites)

        fmt.Fprintln(buf, "# HELP ccp_store_write_errors_total Errors encountered writing to the store")
        fmt.Fprintln(buf, "# TYPE ccp_store_write_errors_total counter")
        fmt.Fprintf(buf, "ccp_store_write_errors_total %d\n", m.storeWriteErrors)

        // rollup duration (histogram) by granularity
        if len(m.rollupLatency) > 0 {
            fmt.Fprintln(buf, "# HELP ccp_rollup_duration_seconds Rollup job duration in seconds")
            fmt.Fprintln(buf, "# TYPE ccp_rollup_duration_seconds histogram")
            for gran, hist := range m.rollupLatency {
                var cumulative int64
                for i, upper := range hist.buckets {
                    cumulative += hist.counts[i]
                    fmt.Fprintf(buf, "ccp_rollup_duration_seconds_bucket{granularity=\"%s\",le=\"%g\"} %d\n", gran, upper, cumulative)
                }
                fmt.Fprintf(buf, "ccp_rollup_duration_seconds_bucket{granularity=\"%s\",le=\"+Inf\"} %d\n", gran, hist.total)
                fmt.Fprintf(buf, "ccp_rollup_duration_seconds_sum{granularity=\"%s\"} %f\n", gran, hist.sum)
                fmt.Fprintf(buf, "ccp_rollup_duration_seconds_count{granularity=\"%s\"} %d\n", gran, hist.total)
            }
        }

        fmt.Fprintln(buf, "# HELP ccp_store_size_bytes Size of the store DB file in bytes")
        fmt.Fprintln(buf, "# TYPE ccp_store_size_bytes gauge")
        fmt.Fprintf(buf, "ccp_store_size_bytes %d\n", m.storeSizeBytes)
    })
}

func (m *metrics) incStoreWrite(ok bool) {
    if m == nil { return }
    m.mu.Lock()
    if ok { m.storeWrites++ } else { m.storeWriteErrors++ }
    m.mu.Unlock()
}

func (m *metrics) observeRollup(granularity string, d time.Duration) {
    if m == nil { return }
    m.mu.Lock()
    hist, ok := m.rollupLatency[granularity]
    if !ok {
        // buckets targeting 0.01s .. 120s
        buckets := []float64{0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30, 60, 120}
        hist = &latencyHistogram{buckets: buckets, counts: make([]int64, len(buckets))}
        m.rollupLatency[granularity] = hist
    }
    s := d.Seconds()
    hist.sum += s
    hist.total++
    for i, upper := range hist.buckets {
        if s <= upper {
            hist.counts[i]++
            break
        }
        if i == len(hist.buckets)-1 {
            hist.counts[i]++
        }
    }
    m.mu.Unlock()
}

func (m *metrics) setStoreSize(bytes int64) {
    if m == nil { return }
    m.mu.Lock()
    m.storeSizeBytes = bytes
    m.mu.Unlock()
}
