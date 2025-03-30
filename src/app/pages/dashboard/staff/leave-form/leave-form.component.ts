import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-leave-form',
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.css'],
})
export class LeaveFormComponent {
  leaveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LeaveFormComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.leaveForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.leaveForm.valid) {
      const leaveDetails = this.leaveForm.value;
      const days = this.calculateDays(leaveDetails.fromDate, leaveDetails.toDate);
  
      try {
        const userId = this.authService.getCurrentUserId();
        const leaveData = {
          ...leaveDetails,
          days: days,
          status: 'pending',
          userId: userId,
        };
  
        this.authService.addLeave(leaveData).subscribe(
          (newLeave) => {
            this.snackBar.open('Leave submitted successfully!', 'Close', {
              duration: 2000,
            });
            
            this.dialogRef.close(newLeave);
          },
          (error) => {
            console.error('Error submitting leave', error);
          }
        );
      } catch (error) {
        console.error('Error getting user ID:', error);
        this.snackBar.open('You must be logged in to submit a leave.', 'Close', {
          duration: 2000,
        });
      }
    } else {
      this.leaveForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  calculateDays(fromDate: string, toDate: string): number {
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  }
}