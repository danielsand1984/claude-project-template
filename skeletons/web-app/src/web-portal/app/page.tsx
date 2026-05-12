import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{`{{PROJECT_TITLE}}`}</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{`{{PROJECT_DESCRIPTION}}`}</p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/example"
          className="rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <h2 className="font-semibold">Example page →</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Server-component data fetch + client-component form.
          </p>
        </Link>

        <a
          href="https://github.com/danielsand1984/claude-project-template"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <h2 className="font-semibold">Template repo ↗</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Conventions and how the scaffold is wired together.
          </p>
        </a>
      </div>
    </main>
  );
}
