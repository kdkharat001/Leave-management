import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup | any;
  loading = false;
  departments = ['Sales', 'Marketing', 'IT', 'HR', 'Finance'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private authServ: AuthService
  ) {}
  ngOnInit(): void {
    this.form();
  }
 form() {
    this.registrationForm = this.fb.group({
      role: ['HOD', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', Validators.required],
      department: ['Sales', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }
  onSubmit() {
    if (this.registrationForm.valid) {
      this.loading = true;
      const userData: any = this.registrationForm.value;

      this.authServ.signUp(userData).subscribe({
        next: (data: any) => {
          console.log('User registered successfully', data);
          this.router.navigate(['/login']);
          this.snackBar.open("Registration successful! Please login.", "Close", {
            duration: 5000,
          });
          
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.snackBar.open("Registration failed. Please try again.", "Close", {
            duration: 5000,
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }
}
