# Code Patterns Reference

> Customize during init — keep only patterns that apply to **this** project. An empty section is fine; a wrong section is harmful.

## API Patterns (delete if no API)

### Request Context

```typescript
{
  orgId: string;
  userId?: string;
  role?: 'admin' | 'member';
  correlationId: string;
}
```

### Route Factory Pattern

```typescript
export function createXxxRouter({ db, redis }): Router {
  const router = Router();
  router.get('/', async (req, res) => { ... });
  return router;
}
```
Mounted in the service entry point. Keeps dependencies explicit.

### Error Response Format

```typescript
{
  error: string;           // Human-readable
  code: string;            // UPPER_SNAKE_CASE
  correlationId: string;
  details?: unknown;
  timestamp?: string;      // ISO 8601
}
```
Helpers: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `internalError()`.

### Middleware order

1. CORS
2. JSON body parser (with size limit)
3. Correlation ID injection
4. Auth token validation (skip public routes)
5. Org context extraction
6. Membership + role check
7. Rate limiting
8. Route handlers
9. Global error handler (respects `err.status`)

## Frontend Patterns (delete if no UI)

### Provider hierarchy

```
<ErrorBoundary>
  <RuntimeConfigProvider>
    <AuthProvider>
      <UserPreferencesProvider>
        <TranslationProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TranslationProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  </RuntimeConfigProvider>
</ErrorBoundary>
```

### Conventions

- `'use client'` only on interactive components.
- Server Components for data-fetching pages.
- API calls via a typed client (one module per resource).
- Translations via `t('key', 'Fallback')` — every visible string.
- Settings inheritance: most-specific wins (e.g. conversation > folder > project > org).

## Database Patterns (delete if no DB)

### Migrations

- Sequential numbering: `NNN_description.sql` (next available: **001**)
- Wrapped in `BEGIN; ... COMMIT;`
- Tracked via `schema_migrations` table
- Forward-only — never modify existing migration files
- Use `TIMESTAMPTZ DEFAULT now()` for timestamps
- Include FK / UNIQUE / CHECK constraints

### Connection pool

- Configurable max connections (default 20)
- 30s idle timeout, 5s connection timeout, 30s statement timeout
- One pool per service

## Worker Patterns (delete if no workers)

### Queue consumer

```python
consumer = RedisQueueConsumer(
    redis_url, topic='audio-chunks',
    group='asr-worker', consumer_name='worker-1'
)
consumer.consume(handler_fn)
```
Stream key format: `queue:{topic}`. Manual ack after successful processing. Retry with exponential backoff.

### Provider pattern (multi-vendor abstractions)

- ABC base class in `base.py`
- Register implementations in `factory.py` `PROVIDERS` dict
- Auto-select first available provider
- Each provider implements the same narrow interface
- Credentials loaded from DB-first with env var fallback, 5-min cache

## CLI Patterns (delete if not a CLI)

### Command structure

- One file per top-level command in `src/commands/`
- Shared options in `src/options.ts` (or `.py`)
- Side effects (HTTP, FS, exec) isolated behind a small adapter so unit tests can stub them
- Exit codes: `0` success, `1` user error, `2` system error, `64+` reserved for tool-specific

### Output

- Default: human-readable with subtle color (respect `NO_COLOR`)
- `--json` flag: stable, line-buffered JSON for scripting
- `--quiet` suppresses progress, only errors to stderr
- Log to stderr, data to stdout — so pipelines work
