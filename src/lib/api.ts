export interface ApiError {
  ok: false;
  code: string;
  message: string;
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
  if (match) return match[2];
  return null;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  const cleanEndpoint = endpoint.startsWith('/v1/')
    ? endpoint
    : `/v1${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const response = await fetch(`${apiBase}/api${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (data && data.message) {
      throw data;
    }
    throw {
      ok: false,
      code: `HTTP_${response.status}`,
      message: data?.detail || `Request failed (${response.status})`,
    };
  }

  return data as T;
}

export const api = {
  login: (data: { identifier?: string; username?: string; password: string; totp_code?: string }) =>
    fetchApi<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: data.identifier || data.username || '',
        password: data.password,
        totp_code: data.totp_code || undefined,
      }),
    }),

  register: (data: { username: string; email: string; password: string; turnstile_token?: string }) =>
    fetchApi<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        turnstile_token: data.turnstile_token || '',
      }),
    }),

  logout: () => fetchApi<any>('/auth/logout', { method: 'POST' }),

  getMe: async () => {
    const res = await fetchApi<any>('/auth/me');
    const u = res?.user || res;
    return {
      ...u,
      id: u.uid || u.id,
      uid: u.uid || u.id,
      hwid: u.hwid?.bound ? 'Bound to hardware' : null,
      hwidInfo: u.hwid,
      subscriptions: u.subscriptions || [],
    };
  },

  redeemKey: (data: { key: string }) =>
    fetchApi<any>('/license/redeem', {
      method: 'POST',
      body: JSON.stringify({ key: data.key.trim().toUpperCase() }),
    }),

  getSubscription: async () => {
    const res = await fetchApi<any>('/subscription');
    const sub = res?.subscription || res;
    const subscriptions = (res?.subscriptions || []).map((s: any) => ({
      ...s,
      active: s?.status === 'active' || s?.status === 'lifetime',
      expiresAt: s?.expires_at,
      daysLeft: s?.days_left ?? 0,
      lifetime: Boolean(s?.lifetime),
      productId: s?.product_id || 'default',
      productName: s?.product_name || 'Default Product',
    }));
    return {
      ...sub,
      active: sub?.status === 'active' || sub?.status === 'lifetime',
      expiresAt: sub?.expires_at,
      daysLeft: sub?.days_left ?? 0,
      lifetime: Boolean(sub?.lifetime),
      productId: sub?.product_id || 'default',
      productName: sub?.product_name || 'Default Product',
      subscriptions,
    };
  },

  resetHwid: (data: { username: string; password: string }) =>
    fetchApi<any>('/hwid/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLatestLoader: async () => {
    const res = await fetchApi<any>('/loader/status?app_id=pruvate_loader_v1');
    return {
      version: res?.version || '1.0.0',
      minVersion: res?.min_version || '1.0.0',
      maintenance: Boolean(res?.maintenance),
    };
  },

  listProducts: async () => {
    const res = await fetchApi<any>('/products');
    return res?.items || [];
  },

  createProduct: async (data: { product_id: string; name: string; description?: string }) => {
    const res = await fetchApi<any>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.product || res;
  },

  deleteProduct: (productId: string) =>
    fetchApi<any>(`/admin/products/${productId}`, {
      method: 'DELETE',
    }),

  listScripts: async (params?: { search?: string; tag?: string; sort?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.tag) qs.set('tag', params.tag);
    if (params?.sort) qs.set('sort', params.sort);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await fetchApi<any>(`/scripts${query}`);
    const items = res?.items || res?.scripts || (Array.isArray(res) ? res : []);
    return items.map((s: any) => ({
      ...s,
      id: s.id,
      name: s.title || s.name || 'Untitled Script',
      authorName: s.author_username || s.author_uid || 'Community',
      createdAt: s.created_at || new Date().toISOString(),
      likes: s.likes ?? 0,
      downloads: s.downloads ?? 0,
      productId: s.product_id || null,
    }));
  },

  getScript: async (id: string) => {
    const res = await fetchApi<any>(`/scripts/${id}`);
    const s = res?.script || res;
    return {
      ...s,
      id: s.id,
      name: s.title || s.name || 'Untitled Script',
      authorName: s.author_username || s.author_uid || 'Community',
      createdAt: s.created_at || new Date().toISOString(),
      likes: s.likes ?? 0,
      downloads: s.downloads ?? 0,
      productId: s.product_id || null,
    };
  },

  createScript: async (data: { title: string; description: string; code: string; tags?: string[]; product_id?: string }) => {
    const res = await fetchApi<any>('/scripts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.script || res;
  },

  deleteScript: (id: string) =>
    fetchApi<any>(`/scripts/${id}`, {
      method: 'DELETE',
    }),

  likeScript: (id: string) =>
    fetchApi<any>(`/scripts/${id}/like`, {
      method: 'POST',
    }),

  downloadScript: (id: string) =>
    fetchApi<any>(`/scripts/${id}/download`, {
      method: 'POST',
    }),

  generateLicenses: async (data: {
    count: number;
    durationDays: number;
    prefix?: string;
    productId?: string;
    productName?: string;
    note?: string;
  }) => {
    const isLifetime = data.durationDays >= 36500;
    const res = await fetchApi<any>('/admin/licenses/generate', {
      method: 'POST',
      body: JSON.stringify({
        prefix: (data.prefix || 'PRV').toUpperCase(),
        quantity: data.count,
        duration_days: isLifetime ? null : data.durationDays,
        lifetime: isLifetime,
        product_id: data.productId || 'default',
        product_name: data.productName || undefined,
        note: data.note || null,
      }),
    });
    return res?.keys || [];
  },

  listLicenses: async () => {
    const res = await fetchApi<any>('/admin/licenses');
    const items = res?.items || [];
    return items.map((lic: any) => ({
      ...lic,
      id: lic.id,
      key: lic.raw_key || `${lic.prefix || 'KEY'}-•••••-••••• (${lic.id.slice(0, 8)})`,
      durationDays: lic.lifetime ? 'Lifetime' : (lic.duration_days ?? 0),
      productId: lic.product_id || 'default',
      productName: lic.product_name || 'Default Product',
      status: (lic.status || 'unused').toUpperCase() === 'CLAIMED' ? 'USED' : (lic.status || 'unused').toUpperCase(),
      usedBy: lic.claimed_by || null,
    }));
  },

  banLicense: (id: string, reason = 'Banned by admin') =>
    fetchApi<any>(`/admin/licenses/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  listUsers: async () => {
    const res = await fetchApi<any>('/admin/users');
    const items = res?.items || [];
    return items.map((u: any) => ({
      ...u,
      id: u.uid || u.id,
      hwid: u.hwid?.combined_hash || null,
      hasActiveSub: u.subscription?.status === 'active' || u.subscription?.status === 'lifetime',
    }));
  },

  banUser: (uid: string, reason = 'Banned by admin') =>
    fetchApi<any>(`/admin/users/${uid}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unbanUser: (uid: string) =>
    fetchApi<any>(`/admin/users/${uid}/unban`, {
      method: 'POST',
    }),

  adminResetHwid: (uid: string) =>
    fetchApi<any>(`/admin/users/${uid}/hwid-reset`, {
      method: 'POST',
    }),

  getStats: async () => {
    const res = await fetchApi<any>('/admin/stats');
    const s = res?.stats || res || {};
    return {
      totalUsers: s.total_users ?? 0,
      activeSubscriptions: s.active_subscriptions ?? 0,
      unusedLicenses: s.licenses?.unused ?? 0,
      bannedUsers: s.licenses?.banned ?? 0,
    };
  },

  listAuditLogs: async () => {
    const res = await fetchApi<any>('/admin/audit-log');
    return res?.items || [];
  },
};
