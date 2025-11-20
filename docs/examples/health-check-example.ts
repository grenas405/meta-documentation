#!/usr/bin/env -S deno run --allow-net

/**
 * @fileoverview Health check utility demonstrating Unix Philosophy
 * @module examples/health-check
 * 
 * Purpose: Check site health and availability
 * Pattern: Single responsibility (health checking only)
 * 
 * Unix Philosophy Implementation:
 * - Do One Thing Well: Only checks health, doesn't deploy or fix issues
 * - Composable: Returns structured data, can be used by other tools
 * - Minimal Output: Quiet by default, verbose with flag
 * - Explicit: Clear interface, no magic
 */

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: string;
}

/**
 * Check health of a service at given port
 * 
 * @param port - Port number to check
 * @returns Health check result
 */
export async function checkHealth(port: number): Promise<HealthCheck> {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    
    const responseTime = Date.now() - start;
    
    return {
      service: `port-${port}`,
      status: response.ok 
        ? (responseTime < 1000 ? 'healthy' : 'degraded')
        : 'unhealthy',
      responseTime,
      timestamp
    };
  } catch (error) {
    return {
      service: `port-${port}`,
      status: 'unhealthy',
      responseTime: Date.now() - start,
      timestamp
    };
  }
}

/**
 * Check multiple services in parallel
 */
export async function checkAllServices(ports: number[]): Promise<HealthCheck[]> {
  return await Promise.all(ports.map(checkHealth));
}

// CLI interface - only when run directly
if (import.meta.main) {
  const ports = Deno.args.map(Number).filter(Boolean);
  
  if (ports.length === 0) {
    console.error("Usage: health-check.ts <port1> <port2> ...");
    Deno.exit(1);
  }
  
  const results = await checkAllServices(ports);
  
  // Structured output for composability
  console.log(JSON.stringify(results, null, 2));
  
  // Exit code indicates overall health
  const allHealthy = results.every(r => r.status === 'healthy');
  Deno.exit(allHealthy ? 0 : 1);
}
