# Monitoring Dashboard Configuration

## Overview

This document provides configuration details for setting up the monitoring dashboards for Sherlock AI using Prometheus and Grafana, with special focus on story progression and user engagement metrics.

## Prometheus Setup

### Basic Configuration
- Scrape Interval: 15s
- Evaluation Interval: 15s

### Metrics Endpoints
- API: http://localhost:8000/metrics
- Bot: http://localhost:8001/metrics
- Database: http://localhost:9187/metrics
- Redis: http://localhost:9121/metrics
- Load Balancer: http://localhost:8080/metrics
- CDN: http://localhost:9100/metrics
- Story Engine: http://localhost:8002/metrics

## Grafana Dashboard Configuration

### Data Sources
- Configure Grafana to use Prometheus as the data source
- Set up story progression tracking metrics
- Configure user engagement monitoring

### Dashboards

#### System Health
- Create dashboards for system health
- Monitor performance metrics
- Track error rates
- Display resource usage

#### Story Metrics
- Story progression tracking
- User engagement metrics
- Response time monitoring
- Content delivery performance

#### Business Metrics
- Subscription status tracking
- Payment processing success rates
- User retention metrics
- Story completion rates

### Alerting
- Set up alert rules for system health
- Configure story progression alerts
- Monitor user engagement thresholds
- Track payment processing issues

## Best Practices

### Dashboard Management
- Regular review of dashboard panels
- Update alert thresholds based on metrics
- Monitor story progression patterns
- Track user engagement trends

### Metric Collection
- Focus on key performance indicators
- Track story completion rates
- Monitor user engagement levels
- Measure AI response quality