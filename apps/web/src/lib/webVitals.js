/**
 * Web Vitals performance monitoring
 * Based on Next.js web vitals implementation
 * Updated for web-vitals v5.0.0
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

/**
 * Metrics thresholds based on Google's Core Web Vitals
 * https://web.dev/vitals/
 */
const thresholds = {
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FID: { good: 100, poor: 300 },  // First Input Delay (ms)
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte (ms)
};

/**
 * Get the rating (good, needs-improvement, poor) based on the metric value and thresholds
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @returns {string} - Rating (good, needs-improvement, poor)
 */
const getRating = (name, value) => {
  if (!thresholds[name]) return 'unknown';
  if (value <= thresholds[name].good) return 'good';
  if (value <= thresholds[name].poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Send metrics to an analytics endpoint
 * @param {Object} metric - Web Vital metric
 */
const sendToAnalytics = (metric) => {
  // Add rating based on thresholds
  const rating = getRating(metric.name, metric.value);
  const body = {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    rating,
    // Add additional information
    page: window.location.pathname,
    timestamp: Date.now(),
  };

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  const url = '/api/analytics/vitals';
  
  // In development, just log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Web Vitals]', body);
    return;
  }

  // In production, send to analytics endpoint
  // This is where you would integrate with your analytics service
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, JSON.stringify(body));
  } else {
    fetch(url, {
      body: JSON.stringify(body),
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

/**
 * Initialize web vitals reporting
 * @param {Function} onPerfEntry - Optional callback for performance entries
 */
export function reportWebVitals(onPerfEntry) {
  if (typeof window === 'undefined') return;

  // Use the provided callback or default to sendToAnalytics
  const reportHandler = onPerfEntry || sendToAnalytics;

  // Measure and report each metric
  onCLS(reportHandler);
  onFID(reportHandler);
  onLCP(reportHandler);
  onFCP(reportHandler);
  onTTFB(reportHandler);
}

/**
 * Get all web vitals metrics for the current page
 * @returns {Promise<Object>} - Object containing all web vitals metrics
 */
export async function getWebVitalsMetrics() {
  if (typeof window === 'undefined') return {};

  return new Promise((resolve) => {
    const metrics = {};
    let metricsCount = 0;
    
    const resolveAfterAllMetrics = () => {
      metricsCount++;
      if (metricsCount === 5) {
        resolve(metrics);
      }
    };

    const handleMetric = ({ name, value, delta, id, entries }) => {
      metrics[name] = {
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        rating: getRating(name, value),
        delta,
        id,
      };
      resolveAfterAllMetrics();
    };

    onCLS(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
  });
}

export default reportWebVitals;
