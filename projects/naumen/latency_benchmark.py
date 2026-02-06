#!/usr/bin/env python3

import requests
import time
import csv
import statistics
from datetime import datetime
import json

print('=== WFM System Latency Benchmark ===')
print()

# WFM component URLs from wfm-integration
wfm_components = {
    'Employee Portal': 'https://wfm-employee-portal.vercel.app',
    'Schedule Grid': 'https://naumen-schedule-grid-system.vercel.app', 
    'Forecasting Analytics': 'https://wfm-forecasting-analytics.vercel.app',
    'Reports Analytics': 'https://wfm-reports-analytics.vercel.app',
    'Employee Management': 'https://employee-management-sigma-eight.vercel.app'
}

def measure_latency(url, num_requests=5):
    """Measure latency for multiple requests to a URL"""
    latencies = []
    
    for i in range(num_requests):
        try:
            start_time = time.perf_counter()
            response = requests.get(url, timeout=10, headers={
                'User-Agent': 'WFM-Latency-Benchmark/1.0'
            })
            end_time = time.perf_counter()
            
            latency_ms = (end_time - start_time) * 1000
            latencies.append(latency_ms)
            
            print(f'  Request {i+1}: {latency_ms:.1f}ms (Status: {response.status_code})')
            
            # Small delay between requests
            time.sleep(0.5)
            
        except requests.exceptions.RequestException as e:
            print(f'  Request {i+1}: ERROR - {e}')
            latencies.append(None)
    
    # Filter out failed requests
    valid_latencies = [lat for lat in latencies if lat is not None]
    
    if not valid_latencies:
        return None
    
    return {
        'min': min(valid_latencies),
        'max': max(valid_latencies), 
        'avg': statistics.mean(valid_latencies),
        'median': statistics.median(valid_latencies),
        'count': len(valid_latencies),
        'success_rate': len(valid_latencies) / num_requests * 100
    }

# Run benchmarks
results = []
timestamp = datetime.now()

print(f'Starting latency benchmarks at {timestamp.strftime("%Y-%m-%d %H:%M:%S")}')
print('Testing 5 requests per component...')
print()

for component_name, url in wfm_components.items():
    print(f'🔍 Testing {component_name}:')
    print(f'   URL: {url}')
    
    stats = measure_latency(url)
    
    if stats:
        print(f'   📊 Results: {stats["avg"]:.1f}ms avg, {stats["median"]:.1f}ms median')
        print(f'   ⚡ Range: {stats["min"]:.1f}ms - {stats["max"]:.1f}ms')
        print(f'   ✅ Success: {stats["success_rate"]:.0f}%')
    else:
        print(f'   ❌ All requests failed')
        stats = {'min': None, 'max': None, 'avg': None, 'median': None, 'count': 0, 'success_rate': 0}
    
    results.append({
        'component': component_name,
        'url': url,
        'timestamp': timestamp.isoformat(),
        **stats
    })
    
    print()

# Calculate overall statistics
successful_results = [r for r in results if r['avg'] is not None]

if successful_results:
    overall_avg = statistics.mean([r['avg'] for r in successful_results])
    overall_median = statistics.median([r['avg'] for r in successful_results])
    
    print('📈 OVERALL PERFORMANCE SUMMARY:')
    print(f'   Average latency across all components: {overall_avg:.1f}ms')
    print(f'   Median latency: {overall_median:.1f}ms')
    print(f'   Components tested: {len(results)}')
    print(f'   Successful components: {len(successful_results)}')
    print()
    
    # Performance categorization
    print('🎯 PERFORMANCE CATEGORIZATION:')
    for result in successful_results:
        avg_lat = result['avg']
        if avg_lat < 500:
            category = '🟢 Excellent'
        elif avg_lat < 1000:
            category = '🟡 Good'  
        elif avg_lat < 2000:
            category = '🟠 Acceptable'
        else:
            category = '🔴 Needs Improvement'
            
        print(f'   {result["component"]:<25} {avg_lat:>6.1f}ms {category}')

# Save detailed results to CSV
with open('latency_benchmark_results.csv', 'w', newline='') as f:
    if results:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)

print()
print('✅ Results saved to latency_benchmark_results.csv')

# Create summary for comparison with other systems
print()
print('📋 COMPETITIVE COMPARISON DATA:')
print('   (Use these numbers for Factory vs AAI comparison)')
print()

for result in successful_results:
    print(f'   {result["component"]}:')
    print(f'     - First response time: {result["min"]:.1f}ms')
    print(f'     - Average response time: {result["avg"]:.1f}ms') 
    print(f'     - 95th percentile est.: {result["max"]:.1f}ms')
    print(f'     - Availability: {result["success_rate"]:.0f}%')
    print()

# Create benchmark summary for presentations
summary = {
    'benchmark_date': timestamp.isoformat(),
    'total_components': len(results),
    'successful_tests': len(successful_results),
    'overall_avg_latency_ms': overall_avg if successful_results else None,
    'performance_rating': 'Production Ready' if overall_avg < 1000 else 'Needs Optimization',
    'components': results
}

with open('latency_benchmark_summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print('✅ Summary saved to latency_benchmark_summary.json')
print()
print('🎉 Benchmark complete! Use CSV data for competitive analysis charts.')