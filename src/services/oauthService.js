// OAuth 2.0 Service for SmartTable — Redirect-based (popup-blocker immune)
// With safe local-dev simulation that works without API keys

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || '';

// Stable origin-only redirect URI — never include path so it's predictable
const getRedirectUri = () =>
  typeof window !== 'undefined' ? window.location.origin + '/' : '';

// ─────────────────────────────────────────────────────────────────────────────
// DEV SIMULATION (no real OAuth keys configured)
// Returns a synthetic profile directly — no URL redirect, no spinner hang
// ─────────────────────────────────────────────────────────────────────────────
const DEV_PROFILES = {
  google: {
    id: 'google_dev_001',
    name: 'Sundhara Pandian',
    email: 'sundhara.pandian@gmail.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SP&backgroundColor=4ade80&fontFamily=Arial&fontSize=40&fontWeight=700',
    provider: 'google'
  },
  apple: {
    id: 'apple_dev_001',
    name: 'Sundhara (Apple ID)',
    email: 'sundhara@privaterelay.appleid.com',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SA&backgroundColor=f59e0b&fontFamily=Arial&fontSize=40&fontWeight=700',
    provider: 'apple'
  }
};

const isDevMode = () =>
  !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID';

/**
 * Initiate OAuth:
 * - In dev (no client ID): immediately returns a synthetic profile via Promise.
 * - In prod (client ID set): navigates to Google/Apple's real auth page.
 *
 * This is deliberately NOT async so it can be called synchronously on click.
 * The returned Promise resolves with a userProfile or rejects with an Error.
 *
 * @param {string} provider 'google' | 'apple'
 * @param {Object} options { role, forceAccountSelect, returnPath }
 * @returns {Promise<{ provider, role, userProfile, returnPath }>}
 */
export const initiateOAuth = (provider, { role = 'customer', forceAccountSelect = true, returnPath = '/' } = {}) => {
  // ── LOCAL DEV: skip redirect entirely, resolve immediately ────────────────
  if (isDevMode()) {
    const profile = DEV_PROFILES[provider] || DEV_PROFILES.google;
    // Return a promise that resolves after a realistic 1.2s "sign-in" delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, provider, role, userProfile: profile, returnPath });
      }, 1200);
    });
  }

  // ── PRODUCTION: real OAuth redirect flow ──────────────────────────────────
  const statePayload = {
    provider,
    role,
    returnPath: returnPath || '/',
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2, 12)
  };

  const stateStr = encodeURIComponent(JSON.stringify(statePayload));

  try {
    sessionStorage.setItem('smarttable_oauth_state', JSON.stringify(statePayload));
  } catch (e) {}

  return new Promise((resolve, reject) => {
    if (provider === 'google') {
      const redirectUri = getRedirectUri();
      const url =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token%20id_token` +
        `&scope=${encodeURIComponent('openid email profile')}` +
        `&prompt=${forceAccountSelect ? 'select_account' : 'consent'}` +
        `&state=${stateStr}` +
        `&nonce=${statePayload.nonce}`;

      window.location.href = url;
      // Promise never resolves here — the page navigates away.
      // Resolution happens via checkOAuthRedirectResult on return.
    } else if (provider === 'apple') {
      const redirectUri = getRedirectUri();
      const url =
        `https://appleid.apple.com/auth/authorize` +
        `?client_id=${encodeURIComponent(APPLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code%20id_token` +
        `&response_mode=fragment` +
        `&scope=${encodeURIComponent('name email')}` +
        `&state=${stateStr}`;

      window.location.href = url;
    } else {
      reject(new Error(`Unknown OAuth provider: ${provider}`));
    }
  });
};

/**
 * Called once on app startup. Checks URL hash/query for OAuth return tokens.
 * Only runs in production mode (when real client IDs are configured).
 *
 * @returns {Promise<Object|null>}
 */
export const checkOAuthRedirectResult = async () => {
  if (typeof window === 'undefined') return null;

  // In dev mode there's no redirect, so nothing to check
  if (isDevMode()) return null;

  const hash = window.location.hash || '';
  const search = window.location.search || '';

  if (!hash && !search) return null;

  let params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);

  // Fall back to query params
  if (!params.get('access_token') && !params.get('id_token') && !params.get('code')) {
    params = new URLSearchParams(search.startsWith('?') ? search.substring(1) : search);
  }

  const accessToken = params.get('access_token');
  const idToken = params.get('id_token');
  const code = params.get('code');
  const rawState = params.get('state');
  const error = params.get('error');

  // Nothing OAuth-related in the URL
  if (!accessToken && !idToken && !code) return null;

  if (error) {
    cleanOAuthUrl();
    throw new Error(params.get('error_description') || error);
  }

  let stateObj = {};
  // Try URL state param first, then sessionStorage
  if (rawState) {
    try { stateObj = JSON.parse(decodeURIComponent(rawState)); } catch (e) {}
  }
  if (!stateObj.provider) {
    try {
      const raw = sessionStorage.getItem('smarttable_oauth_state');
      if (raw) stateObj = JSON.parse(raw);
    } catch (e) {}
  }

  const provider = stateObj.provider || 'google';
  const role = stateObj.role || 'customer';
  const returnPath = stateObj.returnPath || '/';

  let userProfile = null;

  if (accessToken) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const info = await res.json();
        userProfile = {
          id: info.sub,
          name: info.name || info.given_name || 'Google User',
          email: info.email,
          avatar: info.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(info.name || 'G')}`,
          accessToken,
          provider: 'google'
        };
      }
    } catch (err) {
      console.warn('[OAuth] Failed to fetch Google userinfo:', err);
    }
  } else if (idToken) {
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
      userProfile = {
        id: json.sub || `apple_${Date.now()}`,
        name: json.name || (json.email ? json.email.split('@')[0] : 'Apple User'),
        email: json.email || 'user@privaterelay.appleid.com',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(json.email || 'A')}`,
        provider: 'apple'
      };
    } catch (err) {
      console.warn('[OAuth] Failed to parse Apple ID Token:', err);
    }
  }

  cleanOAuthUrl();
  try { sessionStorage.removeItem('smarttable_oauth_state'); } catch (e) {}

  if (userProfile) {
    return { success: true, provider, role, userProfile, returnPath };
  }

  return null;
};

/**
 * Removes OAuth tokens from the browser address bar (both hash and query params).
 */
export const cleanOAuthUrl = () => {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;

  // Remove OAuth hash tokens entirely
  const hasOAuthHash = ['access_token', 'id_token', 'code', 'state', 'oauth_callback'].some(
    key => window.location.hash.includes(key)
  );

  const cleanSearch = window.location.search.replace(
    /(\?|&)(code|state|access_token|id_token|oauth_callback|error|error_description)=[^&]*/g,
    ''
  ).replace(/^\?&/, '?').replace(/\?$/, '');

  const cleanUrl = window.location.pathname + cleanSearch + (hasOAuthHash ? '' : window.location.hash);
  window.history.replaceState({}, document.title, cleanUrl);
};
