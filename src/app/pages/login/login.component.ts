import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.signIn(this.loginForm.value).subscribe({
        next: (user) => {
          console.log('You are logged in', user);
          if (user.role === 'HOD') {
            this.router.navigate(['/hod']);
          } else if (user.role === 'Staff') {
            this.router.navigate(['/staff']);
          }
          this.snackBar.open('Login successful!', 'Close', {
            duration: 2000,
          });
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
            duration: 2000,
          });
          this.loading = false;
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}