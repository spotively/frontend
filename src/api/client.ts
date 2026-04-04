const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }

  // If it's the image generation, it might return an SVG (text/xml)
  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('image/svg+xml')) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
}
