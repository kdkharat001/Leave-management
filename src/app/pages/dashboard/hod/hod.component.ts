import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-hod',
  templateUrl: './hod.component.html',
  styleUrls: ['./hod.component.css'],
})
export class HodComponent implements OnInit {
  leaveRequests: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getAllLeaveRequests().subscribe(
      (requests: any) => {
        this.leaveRequests = requests; 
        
        console.log('Leave requests:', this.leaveRequests);
      },
      (error) => {
        console.error('Failed to fetch leave requests:', error);
      }
    );
  }

  approveLeave(request: any) {
    this.authService.updateLeaveStatus(request.id, 'approved').subscribe(() => {
      request.status = 'approved';
    });
  }

  rejectLeave(request: any) {
    this.authService.updateLeaveStatus(request.id, 'rejected').subscribe(() => {
      request.status = 'rejected';
    });
  }
}
