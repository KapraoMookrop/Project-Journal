import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Verify2FAType } from '../types/Enum';
import { LoginResponseData } from '../types/LoginResponseData';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoreAppService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private readonly http: HttpClient) { }

    async VerifyEmail(verifyToken: string): Promise<void> {

        const observable = this.http.get<void>(
            `${this.baseUrl}/core/VerifyEmail?verifyToken=${verifyToken}`
        );

        const response = await lastValueFrom(observable);
        return response;
    }

    async SendForgotPasswordEmail(email: string): Promise<void> {
        const observable = this.http.post<void>(
            `${this.baseUrl}/core/SendForgotPasswordEmail`, { email }
        );
        const response = await lastValueFrom(observable);
        return response;
    }

    async ChangePassword(token: string, newPassword: string): Promise<void> {
        const observable = this.http.post<void>(
            `${this.baseUrl}/core/ChangePassword`, { token, newPassword }
        );
        const response = await lastValueFrom(observable);
        return response;
    }
}
