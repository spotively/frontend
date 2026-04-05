const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('spotify_access');
  const refreshToken = localStorage.getItem('spotify_refresh');
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (refreshToken) {
    headers.set('x-spotify-refresh', refreshToken);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // If we get a 401 and we have a token, it might be expired
    if (response.status === 401 && token) {
       // Optional: logic to clear local storage if the session is logically dead
       console.warn('Session expired or unauthorized');
    }

    throw new Error(errorData.error || 'API request failed');
  }

  // If it's the image generation, it might return an SVG (text/xml)
  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('image/svg+xml')) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
}
