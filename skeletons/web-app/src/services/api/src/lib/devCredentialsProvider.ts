/**
 * Dev credentials provider. Maps a token like `dev-<name>` to a fake
 * principal. Guarded so it CANNOT run in production:
 *
 *   - NODE_ENV must NOT be 'production'
 *   - ALLOW_DEV_AUTH must be exactly the string "true"
 *
 * Both guards must hold simultaneously. A misconfigured deploy (forgot
 * NODE_ENV) cannot accidentally accept `dev-admin` because ALLOW_DEV_AUTH
 * has to be deliberately set. The dev-admin principal has
 * isPlatformAdmin=true, so this guard is load-bearing.
 *
 * Replace this whole file with a real users-table lookup once you ship.
 */

export interface DevPrincipal {
  userId: string;
  role: 'admin' | 'member';
  email?: string;
  isPlatformAdmin?: boolean;
}

const DEV_USERS: Record<string, DevPrincipal> = {
  admin: {
    userId: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
    email: 'admin@dev.local',
    isPlatformAdmin: true,
  },
  member: {
    userId: '00000000-0000-0000-0000-000000000002',
    role: 'member',
    email: 'member@dev.local',
  },
};

let warned = false;

export async function devCredentialsProvider(token: string): Promise<DevPrincipal> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev credentials provider must not run in production');
  }
  if (process.env.ALLOW_DEV_AUTH !== 'true') {
    throw new Error(
      'Dev auth disabled. Set ALLOW_DEV_AUTH=true to enable dev tokens (NEVER in production).',
    );
  }
  if (!warned) {
    warned = true;
    console.warn(
      JSON.stringify({
        level: 'warn',
        msg: 'auth.dev_mode_active',
        note: 'AUTH_MODE=dev + ALLOW_DEV_AUTH=true — dev tokens accepted. Do not deploy this configuration.',
      }),
    );
  }

  const m = /^dev-(.+)$/.exec(token);
  if (!m) {
    throw new Error('Dev token must look like `dev-admin` or `dev-member`');
  }
  const principal = DEV_USERS[m[1]];
  if (!principal) {
    throw new Error(`Unknown dev user: ${m[1]}`);
  }
  return principal;
}
