import { LoginForm, RegisterForm, User } from '../types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
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
    const accessTokenExpiry = now + (15 * 60 * 1000); // 15 minutes
    const refreshTokenExpiry = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    const accessTokenPayload: MockJWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      exp: Math.floor(accessTokenExpiry / 1000),
      iat: Math.floor(now / 1000)
    };

    const refreshTokenPayload: MockJWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      exp: Math.floor(refreshTokenExpiry / 1000),
      iat: Math.floor(now / 1000)
    };

    // In a real app, these would be properly signed JWTs
    const accessToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(accessTokenPayload))}.mock_signature`;
    const refreshToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(refreshTokenPayload))}.mock_refresh_signature`;

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry
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
    const refreshTime = expiresIn - Date.now() - (2 * 60 * 1000);
    
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

  // Mock login
  async login(credentials: LoginForm): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user lookup (in real app, this would be backend validation)
    const mockUsers: User[] = [
      {
        id: 'user-1',
        email: 'john.student@example.com',
        firstName: 'John',
        lastName: 'Student',
        role: 'student' as const,
        organizationId: 'org-1', // Set default organization ID
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined
      },
      {
        id: 'user-2',
        email: 'jane.teacher@example.com',
        firstName: 'Jane',
        lastName: 'Teacher',
        role: 'teacher' as const,
        organizationId: 'org-1', // Set default organization ID
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined
      },
      {
        id: 'user-3',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const,
        organizationId: 'org-1', // Set default organization ID
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined
      },
      {
        id: 'user-4',
        email: 'super@example.com',
        firstName: 'Super',
        lastName: 'User',
        role: 'superuser' as const,
        organizationId: 'org-1', // Set default organization ID for superuser too
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined
      }
    ];

    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Mock password validation (in real app, this would be hashed comparison)
    if (credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }

    user.lastLogin = new Date();
    const tokens = this.generateTokens(user);
    this.storeTokens(tokens);

    return { user, tokens };
  }

  // Mock register
  async register(userData: RegisterForm): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists (mock)
    if (userData.email === 'existing@example.com') {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tokens = this.generateTokens(newUser);
    this.storeTokens(tokens);

    return { user: newUser, tokens };
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
      organizationId: payload.organizationId,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newTokens = this.generateTokens(user);
    this.storeTokens(newTokens);

    return newTokens;
  }

  // Get current user from token
  getCurrentUser(): User | null {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (!accessToken || this.isTokenExpired(accessToken)) {
      return null;
    }

    const payload = this.decodeToken(accessToken);
    if (!payload) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      firstName: 'Mock',
      lastName: 'User',
      role: payload.role as any,
      organizationId: payload.organizationId,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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

  // Password reset (mock)
  async requestPasswordReset(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Password reset requested for: ${email}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Password reset for token: ${token}`);
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
        lastLogin: undefined
      }
    ];
    
    console.log('Mock user organization reset to Tech Academy (org-1)');
  }

  // Two-factor authentication (mock)
  async enableTwoFactor(): Promise<{ qrCode: string; backupCodes: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      backupCodes: [
        'ABC12345',
        'DEF67890',
        'GHI13579',
        'JKL24680',
        'MNO97531'
      ]
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