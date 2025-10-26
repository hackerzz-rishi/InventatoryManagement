// User related types
export interface User {
  user_id: string;
  username: string;
  email: string;
  role_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  username: string;
  role: string;
}

export type Role = 'ROLE_OFFICE' | 'ROLE_SALES';

// Request body types
export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface RegisterRequestBody {
  username: string;
  password: string;
  email: string;
  role_id: Role;
}

// Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: any;
}

// Export these types to be used in session declaration
export type SessionUser = UserSession;