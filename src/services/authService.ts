import { AxiosError } from 'axios';
import { LoginForm, RegisterPayload, User } from '../types';
import apiClient from './apiClient';
import { mockApi } from './mockApi';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  user: User;
  token: AuthTokens;
}

// Mock JWT token structure for frontend
interface MockJWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  exp: number;
  iat: number;
}

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'lms_access_token';
  private readonly REFRESH_TOKEN_KEY = 'lms_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'lms_token_expiry';
  private refreshTimeout?: NodeJS.Timeout;

  // Generate mock JWT tokens
  private generateTokens(user: User): AuthTokens {
    const now = Date.now();
    const accessTokenExpiry = now + 15 * 60 * 1000; // 15 minutes
    const refreshTokenExpiry = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const accessTokenPayload: MockJWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      exp: Math.floor(accessTokenExpiry / 1000),
      iat: Math.floor(now / 1000),
    };

    const refreshTokenPayload: MockJWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      exp: Math.floor(refreshTokenExpiry / 1000),
      iat: Math.floor(now / 1000),
    };

    // In a real app, these would be properly signed JWTs
    const accessToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(
      JSON.stringify(accessTokenPayload)
    )}.mock_signature`;
    const refreshToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(
      JSON.stringify(refreshTokenPayload)
    )}.mock_refresh_signature`;

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry,
    };
  }

  // Decode mock JWT token
  private decodeToken(token: string): MockJWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    return Date.now() >= payload.exp * 1000;
  }

  // Store tokens securely
  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, tokens.expiresIn.toString());

    // Set up auto-refresh
    this.scheduleTokenRefresh(tokens.expiresIn);
  }

  // Clear stored tokens
  private clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }

  // Schedule token refresh
  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // Refresh 2 minutes before expiry
    const refreshTime = expiresIn - Date.now() - 2 * 60 * 1000;

    if (refreshTime > 0) {
      this.refreshTimeout = setTimeout(async () => {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          this.logout();
        }
      }, refreshTime);
    }
  }

  // login
  async login(credentials: LoginForm): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Attempting login with credentials:', credentials);

      // First try the real API, fallback to mock if it fails
      try {
        const response = await apiClient.post('/user/login', credentials);
        console.log('[AuthService] Received response from backend:', response.data);

        let { user, token } = response.data;

        // Map accountType to role if role is missing
        if (!user.role && user.accountType) {
          user = {
            ...user,
            role: user.accountType, // <— normalize field
          };
        }

        // Convert backend token string to AuthTokens
        const authTokens: AuthTokens = {
          accessToken: token, // backend token string
          refreshToken: token, // reuse same token for mock refresh
          expiresIn: Date.now() + 15 * 60 * 1000, // 15 min expiry
        };

        console.log('[AuthService] Storing token in localStorage:', authTokens);
        this.storeTokens(authTokens);

        console.log('[AuthService] Login successful for user:', user.email);
        return { user, token: authTokens };
      } catch (apiError: any) {
        // If real API fails, fallback to mock API
        console.log('[AuthService] Real API failed, falling back to mock API');
        const mockResponse = await mockApi.login(credentials);
        
        // Generate proper tokens for mock user
        const authTokens = this.generateTokens(mockResponse.user);
        this.storeTokens(authTokens);
        
        console.log('[AuthService] Mock login successful for user:', mockResponse.user.email);
        return { user: mockResponse.user, token: authTokens };
      }
    } catch (error: any) {
      console.error('[AuthService] Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  // register
  async register(userData: RegisterPayload): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Payload for Backend:', userData);

      // First try the real API, fallback to mock if it fails
      try {
        //  Make the real API call
        const response = await apiClient.post('/user/signUp', userData);
        console.log('[AuthService] Response from Backend:', response.data);

        // Extract the real data
        const { token, user } = response.data;

        // Map `accountType` to `role` for frontend consistency
        const normalizedUser = {
          ...user,
          role: user.role || user.accountType || 'student',
          accountType: user.accountType || user.role || 'student',
        };

        // Store tokens (use the one returned by backend)
        const authTokens: AuthTokens = {
          accessToken: token,
          refreshToken: token, // optional: replace when backend supports real refresh token
          expiresIn: Date.now() + 15 * 60 * 1000, // 15 minutes
        };

        this.storeTokens(authTokens);

        // Return the real user and tokens
        return { user: normalizedUser, token: authTokens };
      } catch (apiError: any) {
        // If real API fails, fallback to mock API
        console.log('[AuthService] Real API failed, falling back to mock API for registration');
        const mockResponse = await mockApi.register(userData as any);
        
        // Generate proper tokens for mock user
        const authTokens = this.generateTokens(mockResponse.user);
        this.storeTokens(authTokens);
        
        console.log('[AuthService] Mock registration successful for user:', mockResponse.user.email);
        return { user: mockResponse.user, token: authTokens };
      }
    } catch (error: any) {
      console.error('[AuthService] Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken || this.isTokenExpired(refreshToken)) {
      throw new Error('Refresh token expired');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const payload = this.decodeToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Mock user data (in real app, fetch from backend)
    const user: User = {
      id: payload.userId,
      email: payload.email,
      firstName: 'Mock',
      lastName: 'User',
      role: payload.role as any,
      accountType: payload.role as any,
      organizationId: payload.organizationId,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newTokens = this.generateTokens(user);
    this.storeTokens(newTokens);

    return newTokens;
  }

  // Get current user from token
  getCurrentUser(): User | null {
    try {
      // Check Zustand persisted store for user
      const persisted = localStorage.getItem('auth-storage');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        const user = parsed?.state?.user;
        if (user) return user; // ✅ return actual stored user
      }

      return null; // If nothing stored
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      return null;
    }
  }

  // Get access token
  getAccessToken(): string | null {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (!token || this.isTokenExpired(token)) {
      return null;
    }
    return token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  // Logout
  logout(): void {
    this.clearTokens();

    // In a real app, you might want to invalidate the refresh token on the server
    // await this.revokeRefreshToken();
  }

  // Initialize auth state (call on app startup)
  async initialize(): Promise<User | null> {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (!accessToken || !refreshToken) {
      return null;
    }

    // If access token is expired but refresh token is valid, refresh
    if (this.isTokenExpired(accessToken)) {
      if (!this.isTokenExpired(refreshToken)) {
        try {
          await this.refreshAccessToken();
          return this.getCurrentUser();
        } catch {
          this.clearTokens();
          return null;
        }
      } else {
        this.clearTokens();
        return null;
      }
    }

    // Set up auto-refresh for valid token
    if (expiryTime) {
      this.scheduleTokenRefresh(parseInt(expiryTime));
    }

    return this.getCurrentUser();
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('payload to the Backend', email);
      const response = await apiClient.post('/user/forgetPassword-otp', { email });
      console.log(`✅ Password reset OTP sent to ${email}`, response.data);
      if (response.data.token) {
        localStorage.setItem('resetToken', response.data.token);
        console.log('🔐 Temporary reset token saved:', response.data.token);
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('❌ Error sending password reset OTP:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to send password reset OTP.');
    }
  }

    // verify One time Password
  async verifyForgotPasswordOtp(email: string, otp: string): Promise<void> {
    try {
      console.log('OTP TO THE BACKEND', otp, email);
      const response = await apiClient.post('/user/verify-forgotPasswordOtp', {
        email,
        otp
      });
      console.log('✅ OTP verified successfully:', response.data);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('❌ Error verifying password reset OTP:', err.response?.data || err.message);
      throw new Error(err.response?.data?.message || 'Failed to verify OTP.');
    }
  }

  // resend One time Password
  async resendOtp(email: string):Promise<void>{
    try {
      const response = await apiClient.post('/user/resend-otp', { email });
       console.log('✅ OTP resent successfully:', response.data);
    } catch (error:any) {
      console.error('❌ Error resending OTP:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || " Failed to resend OTP")
    }
  }
  
  async resetPassword(email: string, newPassword:string): Promise<void> {
    try {
      console.log("PAYLOAD TO THE BACKEND", email, newPassword )
      const response = await apiClient.post('/user/newPassword', { email, newPassword });
      console.log("RESPONSE FROM BACKEND : ", response.data)
    } catch (error: any) {
      console.log(" ERROR RESPONSE FROM BACKEND", error.response?.data || error.message )
      throw new Error(error.response?.data?.message || " Failed to Reset Password")
    }
  }

  // Dev function to reset organization for mock user
  resetMockUserOrganization(): void {
    // This is a dev-only function to reset the mock user's organization
    const mockUsers = [
      {
        id: 'user-1',
        email: 'john.student@example.com',
        firstName: 'John',
        lastName: 'Student',
        role: 'student' as const,
        organizationId: 'org-1',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined,
      },
    ];

    console.log('Mock user organization reset to Tech Academy (org-1)');
  }

  // Two-factor authentication (mock)
  async enableTwoFactor(): Promise<{ qrCode: string; backupCodes: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      qrCode:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      backupCodes: ['ABC12345', 'DEF67890', 'GHI13579', 'JKL24680', 'MNO97531'],
    };
  }

  async verifyTwoFactor(code: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return code === '123456'; // Mock verification
  }

  async disableTwoFactor(password: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Two-factor authentication disabled');
  }
}

export const authService = new AuthService();