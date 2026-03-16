import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { LoginResponseData } from '../types/LoginResponseData';
import { environment } from '../../environments/environment';
import { LoginDataRequest } from '../types/LoginDataRequest';
import { SignUpDataRequest } from '../types/SignUpDataRequest';

@Injectable({
    providedIn: 'root'
})
export class UserAppService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private readonly http: HttpClient) { }
    async Login(request: LoginDataRequest): Promise<LoginResponseData> {

        const observable = this.http.post<LoginResponseData>(
            `${this.baseUrl}/users/Login`, request
        );

        const response = await lastValueFrom(observable);
        return response;
    }

    async Signup(request: SignUpDataRequest): Promise<void> {

        const observable = this.http.post<void>(
            `${this.baseUrl}/users/SignUp`, request
        );

        const response = await lastValueFrom(observable);
        return response;
    }

    async CheckAlreadyExistsEmail(email: string): Promise<boolean> {

        const observable = this.http.get<{ exists: boolean }>(
            `${this.baseUrl}/users/CheckAlreadyExistsEmail?email=${email}`
        );
        const response = await lastValueFrom(observable);
        return response.exists;
    }
}
