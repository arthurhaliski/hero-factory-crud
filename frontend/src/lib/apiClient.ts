const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      const error = new Error(errorData?.message || 'API request failed') as any;
      error.status = response.status;
      error.response = errorData;
      throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(error);
    throw error; 
  }
}

export default apiClient; 