import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth/auth-service';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [
    MessageModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    FloatLabelModule,
    PasswordModule,
    NgClass,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  messageService = inject(MessageService);
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      this.authService.login(payload).subscribe({
        next: (data: any) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          this.router.navigate(['']);
          this.loginForm.reset();
          this.formSubmitted = false;
        },
        error: (err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message ?? err.message ?? 'Something went wrong',
          });
        },
      });
    }
  }

  isInvalid(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}
