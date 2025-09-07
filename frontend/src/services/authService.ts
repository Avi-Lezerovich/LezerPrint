import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStore = JSON.parse(localStorage.getItem('lezerprint-auth') || '{}');
    if (authStore.state?.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.state.accessToken}`;
    }
  }
  return config;
});

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

export default authService;