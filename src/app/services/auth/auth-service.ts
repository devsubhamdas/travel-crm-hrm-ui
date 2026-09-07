import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

interface LoginDto {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Example: fetched from token / API
  private user = {
    role: 'admin', // 'admin' | 'staff' | 'user'
    username: 'username',
  };

  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private apiUrl = environment.apiUrl;

  login(dto: LoginDto) {
    return this.http.post(`${this.apiUrl}/auth/login`, dto);
  }

  logout() {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  getUser(id: number) {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  getUserByRole(role: string) {
    return this.http.get(`${this.apiUrl}/users?role=${role}`);
  }

  getUserId() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem('accessToken');
    // console.log(token);
    if (!token) return null;
    const decoded = this.jwtHelper.decodeToken(token);

    return decoded?.id || decoded?.sub || null;
  }

  getRole() {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem('accessToken');
    // console.log(token);
    if (!token) return null;
    const decoded = this.jwtHelper.decodeToken(token);

    return decoded?.role || null;
  }

  hasPermission(roles: string[]): boolean {
    const role = this.getRole();
    if (!role) return false;
    return roles.includes(role);
  }

  isAdmin(): boolean {
    return this.user.role === 'admin';
  }
}
