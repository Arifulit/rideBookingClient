export type UserRole = 'rider' | 'driver' | 'admin';

export type AccountStatus = 
  | 'active' 
  | 'inactive' 
  | 'blocked' 
  | 'suspended' 
  | 'pending_verification'
  | 'offline_restricted';

export type DriverStatus = 
  | 'online' 
  | 'offline' 
  | 'busy' 
  | 'break';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  accountStatus: AccountStatus;
  profileImage?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface DriverUser extends User {
  role: 'driver';
  driverStatus: DriverStatus;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    type: 'sedan' | 'suv' | 'bike' | 'auto';
  };
  licenseInfo?: {
    number: string;
    expiryDate: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  };
}

export interface RiderUser extends User {
  role: 'rider';
  preferredPaymentMethod?: 'cash' | 'card' | 'wallet';
  homeAddress?: string;
  workAddress?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
  adminLevel: 'super_admin' | 'admin' | 'moderator';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | DriverUser | RiderUser | AdminUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}

// Login Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User | DriverUser | RiderUser | AdminUser;
  tokens: AuthTokens;
  message: string;
}

// Registration Types
export interface BaseRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  termsAccepted: boolean;
}

export interface RiderRegistrationRequest extends BaseRegistrationRequest {
  role: 'rider';
  preferredPaymentMethod?: 'cash' | 'card' | 'wallet';
  homeAddress?: string;
  workAddress?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface DriverRegistrationRequest extends BaseRegistrationRequest {
  role: 'driver';
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
    type: 'sedan' | 'suv' | 'bike' | 'auto';
  };
  licenseInfo: {
    number: string;
    expiryDate: string;
  };
  documents: {
    licenseImage: File;
    vehicleRegistration: File;
    insurance: File;
  };
}

export interface AdminRegistrationRequest extends BaseRegistrationRequest {
  role: 'admin';
  adminLevel: 'admin' | 'moderator';
  invitationCode: string;
}

export type RegistrationRequest = 
  | RiderRegistrationRequest 
  | DriverRegistrationRequest 
  | AdminRegistrationRequest;

export interface RegistrationResponse {
  user: User | DriverUser | RiderUser | AdminUser;
  tokens: AuthTokens;
  message: string;
  requiresVerification?: boolean;
}

// Token Refresh Types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  message: string;
}

// Password Reset Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetTokenSent: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

// Account Status Types
export interface AccountStatusInfo {
  status: AccountStatus;
  message: string;
  blockReason?: string;
  suspensionEndDate?: string;
  canAppeal: boolean;
  supportContact?: {
    email: string;
    phone: string;
  };
  allowedActions: string[];
}

export interface AccountStatusResponse {
  accountStatus: AccountStatusInfo;
  user: User;
}

// Email/Phone Verification Types
export interface VerificationRequest {
  type: 'email' | 'phone';
  code: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  verified: boolean;
}

export interface ResendVerificationRequest {
  type: 'email' | 'phone';
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  codeSent: boolean;
}

// Profile Update Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: File;
}

export interface UpdateProfileResponse {
  user: User | DriverUser | RiderUser | AdminUser;
  message: string;
}

// Change Password Types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Logout Types
export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// API Error Types
export interface AuthError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface AuthApiError {
  status: number;
  data: {
    error: AuthError;
    timestamp: string;
    path: string;
  };
}

// Form Validation Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegistrationFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  termsAccepted: boolean;

  // Rider Specific
  preferredPaymentMethod?: 'cash' | 'card' | 'wallet';
  homeAddress?: string;
  workAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Driver Specific
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  vehicleLicensePlate?: string;
  vehicleType?: 'sedan' | 'suv' | 'bike' | 'auto';
  licenseNumber?: string;
  licenseExpiryDate?: string;
  licenseImage?: File;
  vehicleRegistration?: File;
  insurance?: File;

  // Admin Specific
  adminLevel?: 'admin' | 'moderator';
  invitationCode?: string;
}

// Route Protection Types
export interface RoutePermission {
  roles: UserRole[];
  statuses: AccountStatus[];
  requiresVerification?: {
    email?: boolean;
    phone?: boolean;
  };
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  permission: RoutePermission;
  fallbackPath?: string;
  showStatusPage?: boolean;
}

// Authentication Context Types
export interface AuthContextType {
  user: User | DriverUser | RiderUser | AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegistrationRequest) => Promise<RegistrationResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
  changePassword: (data: ChangePasswordRequest) => Promise<ChangePasswordResponse>;
  checkAccountStatus: () => Promise<AccountStatusResponse>;
  verifyEmail: (code: string) => Promise<VerificationResponse>;
  verifyPhone: (code: string) => Promise<VerificationResponse>;
  resendVerification: (type: 'email' | 'phone') => Promise<ResendVerificationResponse>;
}