import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'game-confirm-page',
  templateUrl: './confirm-page.component.html',
  standalone: false,
})
export class ConfirmPageComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  email = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.email) return;
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.confirmSignUp(this.email, this.form.value.code);
      await this.router.navigate(['/auth/login']);
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
    return 'Confirmation failed. Please try again.';
  }
}
