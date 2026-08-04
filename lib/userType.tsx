
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileUrl?: string | null;
  stripeCustomerId?: string | null;
  hasActiveSubscription: boolean;
  otp?: number | null;
  otpExpiresAt?: string | null;
  isTwoFactorEnabled: boolean;
  password: string;
  role: "USER" | "ADMIN" | "SUPERADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  country: string;
  type: string;
}

export interface UsersMeta {
  page: number;
  limit: number;
  total: number;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    meta: UsersMeta;
    data: User[];
  };
}