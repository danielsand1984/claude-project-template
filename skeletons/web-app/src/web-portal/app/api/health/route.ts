// Health endpoint for k8s liveness/readiness probes on the web pod.
// Intentionally cheap: no external calls, returns immediately.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(): Promise<Response> {
  return Response.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
