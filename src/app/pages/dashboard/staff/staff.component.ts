import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { LeaveFormComponent } from './leave-form/leave-form.component';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css'],
})
export class StaffComponent implements OnInit {
  loggedUser: any;
  appliedLeaves: any[] = [];
  totalLeaves: number = 0;
  approvedLeaves: number = 0;
  rejectedLeaves: number = 0;

  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit() {
    this.authService.loggedUser.subscribe((user) => {
      this.loggedUser = user;

      if (user) {
        this.authService.getLeavesForLoggedUser(user.userId).subscribe((leaves: any) => {
          this.appliedLeaves = leaves;
          console.log('Applied leaves for the logged-in user:', this.appliedLeaves);
          this.calculateLeaveCounts(); 
        });
      }
    });
  }

  openLeaveFormDialog() {
    const dialogRef = this.dialog.open(LeaveFormComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((newLeave) => {
      if (newLeave) {
        this.appliedLeaves = [newLeave, ...this.appliedLeaves];
        console.log('New leave added:', newLeave);
        this.calculateLeaveCounts(); 
      }
    });
  }

  calculateLeaveCounts() {
    this.totalLeaves = this.appliedLeaves.length;
    this.approvedLeaves = this.appliedLeaves.filter(leave => leave.status === 'approved').length;
    this.rejectedLeaves = this.appliedLeaves.filter(leave => leave.status === 'rejected').length;
  }
}
