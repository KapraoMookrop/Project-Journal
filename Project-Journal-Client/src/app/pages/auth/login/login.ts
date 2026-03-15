import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UserAppService } from '../../../API/UserAppService';
import Swal from 'sweetalert2';
import { LoadingService } from '../../../core/LoadingService';
import { AuthService } from '../../../core/AuthService';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CoreAppService } from '../../../API/CoreAppService';
import { Verify2FAType } from '../../../types/Enum';
import { LoginResponseData } from '../../../types/LoginResponseData';
import { LoginDataRequest } from '../../../types/LoginDataRequest';
import { SignUpDataRequest } from '../../../types/SignUpDataRequest';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, NgSelectModule],
  providers: [],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  IsShowPassword: boolean = false;
  IsShowConfirmPassword: boolean = false;
  UserLoginRequest: LoginDataRequest = {} as LoginDataRequest;
  UserSignUpRequest: SignUpDataRequest = {} as SignUpDataRequest;
  ConfirmPassword?: string;

  constructor(public loadingService: LoadingService,
    private readonly AuthService: AuthService,
    private readonly UserAppService: UserAppService,
    private readonly CoreAppService: CoreAppService,
    private readonly router: Router) {
  }

  ngOnInit() {

  }

  isLogin = true;
  toggle() {
    this.isLogin = !this.isLogin;
  }

  async Login() {
    try {

      this.loadingService.show();
      let clientLogin = await this.UserAppService.Login(this.UserLoginRequest);
      this.loadingService.hide();

      await this.AfterLogin(clientLogin);

    } catch (err: HttpErrorResponse | any) {

      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: err.error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      });

    } finally {
      this.loadingService.hide();
    }
  }

  step = 1;
  nextStep() {
    switch (this.step) {
      case 1:
        if (!this.isValidEmail(this.UserSignUpRequest.Email)) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            html: `<div class="text-lg font-medium">
                    รูปแบบอีเมลไม่ถูกต้อง
                  </div>`,
            showConfirmButton: false,
            timer: 2000,
          })
          return;
        }

        if (!this.UserSignUpRequest.Email || !this.UserSignUpRequest.Password || !this.ConfirmPassword) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            html: `<div class="text-lg font-medium">
                    กรุณากรอกข้อมูลให้ครบถ้วนก่อน
                  </div>`,
            showConfirmButton: false,
            timer: 2000,
          })
          return;
        }

        if (this.UserSignUpRequest.Password !== this.ConfirmPassword) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            html: `<div class="text-lg font-medium">
                    รหัสผ่านไม่ตรงกัน
                  </div>`,
            showConfirmButton: false,
            timer: 2000,
          })
          return;
        }

        this.step++;
        break;
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  async Signup() {
    this.loadingService.show();
    try {
      await this.UserAppService.Signup(this.UserSignUpRequest);

      Swal.fire({
        icon: 'success',
        title: 'สมัครสมาชิกสำเร็จ',
        text: 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ',
      });

      this.isLogin = true;

    } catch (err: HttpErrorResponse | any) {
      Swal.fire({
        icon: 'error',
        title: 'สมัครสมาชิกไม่สำเร็จ',
        text: err.error?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
      });

      console.error('Signup failed:', err);
    } finally {
      this.loadingService.hide();
    }
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const regex = /^\d{10}$/;
    return regex.test(phone);
  }

  private async AfterLogin(clientData: LoginResponseData) {

    Swal.fire({
      icon: 'success',
      title: 'เข้าสู่ระบบสำเร็จ',
      text: 'ยินดีต้อนรับเข้าสู่ระบบ',
      timer: 1500,
      showConfirmButton: false
    }).then(async () => {
      await this.AuthService.SetJWTToken(clientData.JWT);
      await this.AuthService.LoadUserFromToken();
      this.router.navigate(['/home']);
    });

  }
}