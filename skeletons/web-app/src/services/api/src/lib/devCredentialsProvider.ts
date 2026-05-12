/**
 * Dev credentials provider. Maps a token like `dev-<userId>` to a fake
 * principal. Use ONLY when AUTH_MODE=dev. Never reachable in production.
 *
 * Replace this with a real lookup against your `users` table once
 * you have one, or with OIDC token verification.
 */

export interface DevPrincipal {
  userId: string;
  role: 'admin' | 'member';
  email?: string;
  isPlatformAdmin?: boolean;
}

const DEV_USERS: Record<string, DevPrincipal> = {
  // Default dev user — works out of the box with seed data.
  'admin': {
    userId: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
    email: 'admin@dev.local',
    isPlatformAdmin: true,
  },
  'member': {
    userId: '00000000-0000-0000-0000-000000000002',
    role: 'member',
    email: 'member@dev.local',
  },
};

export async function devCredentialsProvider(token: string): Promise<DevPrincipal> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('dev credentials provider must not be used in production');
  }
  // Token format: `dev-<key>` where key matches DEV_USERS.
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
