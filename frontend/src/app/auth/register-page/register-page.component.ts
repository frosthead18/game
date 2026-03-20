import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'game-register-page',
  templateUrl: './register-page.component.html',
  standalone: false,
})
export class RegisterPageComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.signUp(
        this.form.value.username,
        this.form.value.email,
        this.form.value.password,
      );
      await this.router.navigate(['/auth/confirm'], {
        queryParams: { email: this.form.value.email },
      });
    } catch (err: unknown) {
      this.errorMessage = this.extractMessage(err);
    } finally {
      this.loading = false;
    }
  }

  private extractMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return (err.error as { message?: string })?.message ?? err.message;
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return (err as { message: string }).message;
    }
    return 'Registration failed. Please try again.';
  }
}
