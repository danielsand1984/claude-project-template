// Example page demonstrating the two main data patterns:
//   - Server Component data fetch (this file)
//   - Client Component form submission (`example-form.tsx`)
//
// Replace with your real route. Delete the whole `app/example/` folder
// once you have real pages.

import { apiClient, ApiError } from '../../lib/api-client';
import { ExampleForm } from '../../components/example-form';

interface Health {
  status: 'ok' | 'ready' | 'not_ready';
  timestamp: string;
}

async function fetchHealth(): Promise<Health | { error: string }> {
  // In a real app, get token + orgId from your auth provider (server-side).
  // For demo purposes we hit the public /healthz endpoint without auth.
  try {
    const client = apiClient();
    return await client.get<Health>('/healthz');
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: `${err.code}: ${err.message}` };
    }
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export default async function ExamplePage() {
  const health = await fetchHealth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Example</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Server-side fetch + client-side form. Replace with your real page.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">API health (server-side fetch)</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-900">
          {JSON.stringify(health, null, 2)}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Form (client-side)</h2>
        <ExampleForm />
      </section>
    </main>
  );
}
