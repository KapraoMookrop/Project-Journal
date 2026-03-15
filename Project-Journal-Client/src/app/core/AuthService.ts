import { Injectable } from "@angular/core";
import { AppStateService } from "./AppStateService";
import { UserClientData } from "../types/UserClientData";
import { jwtDecode} from "jwt-decode";
import { Router } from "@angular/router";
import { UserRole, UserStatus } from "../types/Enum";


@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private readonly state: AppStateService, 
              private router: Router) { }

  async SetUserClient(user: UserClientData, userId: string) {
    this.state.user.set(user);
    this.state.userId.set(userId);
  }

  SetJWTToken(token: string) {
    this.state.token.set(token);
    localStorage.setItem('token', token);
  }

  ClearUserClient() {
    this.state.token.set(null);
    this.state.user.set(null);

    localStorage.removeItem('token');
  }

  UpdateUser(data: Partial<UserClientData>) {
    this.state.user.update(user => ({
      ...user!,
      ...data
    }));
  }

  async LoadUserFromToken() {
    const token = localStorage.getItem('token') || undefined;

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const decodeJwt = jwtDecode<JwtPayload>(token);

      const userClient: UserClientData = {
        Email: decodeJwt.email,
        Name: decodeJwt.name,
        SurName: decodeJwt.surname,
        Role: decodeJwt.role,
        Phone: decodeJwt.phone,
        UserStatus: decodeJwt.userStatus
      };

      this.SetUserClient(userClient, decodeJwt.userId);

    } catch (err) {
      console.error('Invalid token', err);
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  userStatus: UserStatus;
  name: string;
  surname: string;
  phone: string;
}