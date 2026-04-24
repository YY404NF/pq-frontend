function normalizeOrigin() {
  if (typeof window === 'undefined') {
    return 'http://localhost'
  }
  return `${window.location.protocol}//${window.location.hostname}`
}

function resolveUrl(envKey: string, fallback: string) {
  const value = import.meta.env[envKey]
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }
  return fallback
}

export function resolveServerApiUrl(serverName: 'a' | 'b') {
  if (serverName === 'a') {
    return import.meta.env.DEV
      ? resolveUrl('VITE_SERVER_A_URL', '/server-a')
      : resolveUrl('VITE_SERVER_A_URL', `${normalizeOrigin()}:18081`)
  }
  return import.meta.env.DEV
    ? resolveUrl('VITE_SERVER_B_URL', '/server-b')
    : resolveUrl('VITE_SERVER_B_URL', `${normalizeOrigin()}:18082`)
}

export function resolveServerDisplayUrl(serverName: 'a' | 'b') {
  if (serverName === 'a') {
    return resolveUrl('VITE_PUBLIC_SERVER_A_URL', `${normalizeOrigin()}:18081`)
  }
  return resolveUrl('VITE_PUBLIC_SERVER_B_URL', `${normalizeOrigin()}:18082`)
}
