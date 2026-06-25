import {jwtDecode} from 'jwt-decode';
import {Role} from '../enums/role.enum';

interface JwtPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}

export class TokenHelper {
  static decode(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  static getRole(token: string): Role | null {
    const decoded = this.decode(token);
    return decoded?.role ?? null;
  }

  static getEmail(token: string): string | null {
    const decoded = this.decode(token);
    return decoded?.sub ?? null;
  }

  static isExpired(token: string): boolean {
    const decoded = this.decode(token);
    if (!decoded) return true;
    return decoded.exp * 1000 < Date.now();
  }

  static isAdmin(token: string): boolean {
    return this.getRole(token) === Role.ADMIN;
  }

  static isClient(token: string): boolean {
    return this.getRole(token) === Role.CLIENT;
  }
}
