import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, switchMap, catchError, throwError, map, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private hodDataBase = 'https://leave-management-92088-default-rtdb.firebaseio.com/hod.json';
  private staffDataBase = 'https://leave-management-92088-default-rtdb.firebaseio.com/staff.json';
  private leaveDatabase = 'https://leave-management-92088-default-rtdb.firebaseio.com/leaves.json';
  private signUpUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBd9zhUHRvHiK9Fp7WuydIzRQ6CGi3Ayl4';
  private signInUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBd9zhUHRvHiK9Fp7WuydIzRQ6CGi3Ayl4';

  private loggedUserSubject = new BehaviorSubject<any>(null);
  loggedUser = this.loggedUserSubject.asObservable();

  
  constructor(private http: HttpClient, private router: Router) {}

  getCurrentUserId(): string {
    const user = this.loggedUserSubject.value;
    if(user){
      return   user.userId
    }else{
      return '';
    }
  }

  
  signUp(userObj: any) {
    const payload = {
      email: userObj.email,
      password: userObj.password,
      returnSecureToken: true,
    };
  
    return this.http.post<{ localId: string }>(this.signUpUrl, payload).pipe(
      switchMap((Response) => {
        const userData = {
          ...userObj,
          userId: Response.localId,  
        };
  
        const userDatabase = userObj.role === 'HOD' ? this.hodDataBase : this.staffDataBase;
        console.log('User database:', userData);
        return this.http.post(userDatabase, userData);
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Registration failed.'));
      })
    );
  }
  

  signIn(loginObj: any) {
    const payload = {
      email: loginObj.emailId,
      password: loginObj.password,
      returnSecureToken: true,
    };
    
    return this.http.post<any>(this.signInUrl, payload).pipe(
      switchMap((response) => {
        const user = {
          email: response.email,
          token: response.idToken,
        };

        return forkJoin({
          hodData: this.http.get<any>(this.hodDataBase),
          staffData: this.http.get<any>(this.staffDataBase),
        }).pipe(
          map((data) => {
            const hodUsers = Object.values(data.hodData);
            const staffUsers = Object.values(data.staffData);
            
            const hodUser = hodUsers.find((u: any) => u.email === user.email);
            if (hodUser) {
              const loggedUser = { ...user, ...hodUser, role: 'HOD' };
              this.loggedUserSubject.next(loggedUser);
              return loggedUser;
            }

            const staffUser = staffUsers.find((u: any) => u.email === user.email);
            if (staffUser) {
              const loggedUser = { ...user, ...staffUser, role: 'Staff' };
              this.loggedUserSubject.next(loggedUser);
              return loggedUser;
            }

            throw new Error('User not found');
          }),
          catchError((error) => {
            return throwError(() => new Error('User not found'));
          })
        );
      }),
      catchError((error) => {
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );
  }

  addLeave(data: any) {
    const userId = this.getCurrentUserId();
    const leaveData = { ...data, userId }; 
    return this.http.post(this.leaveDatabase, leaveData).pipe(
      map((response: any) => {
        const leaveId = response.name;
        return { id: leaveId, ...leaveData }; 
      })
    );
  }

  getLeavesForLoggedUser(userId: string) { 
    return this.http.get(this.leaveDatabase).pipe(
      map((leaves: any) => {
        console.log('logged usr leaves', leaves);
        return Object.keys(leaves)
          .map((key) => ({ id: key, ...leaves[key] }))
          .filter((leave) => leave.userId === userId); 
      })
    );
  }

  getAllLeaveRequests() {
    return forkJoin({
      leaves: this.http.get<{ [key: string]: any }>(this.leaveDatabase),
      staffData: this.http.get<{ [key: string]: any }>(this.staffDataBase),
    }).pipe(
      map(({ leaves, staffData }) => {
        if (!leaves) return []; 
  
        const staffList = Object.entries(staffData).map(([key, value]) => ({
          id: key,
          userId: value.userId, 
          firstName: value.firstName,
          lastName: value.lastName,
        }))
       
  
        console.log('Staff List:', staffList); 
        console.log('Leave Data:', leaves); 
  
        return Object.keys(leaves).map((key) => {
          const leave = { id: key, ...(leaves[key] as any) };
          const staffMember = staffList.find((s) => s.userId === leave.userId);
  
          return {
            ...leave,
            firstName: staffMember ? staffMember.firstName : 'Unknown',
            lastName: staffMember ? staffMember.lastName : 'Unknown',
          };
        });
      }),
      catchError((error) => {
        console.error('Error fetching leave requests:', error);
        return throwError(() => new Error('Failed to get leave requests'));
      })
    );
  }
  
 


  

  updateLeaveStatus(leaveId: string, status: string) {
  const updatedUrl = `https://leave-management-92088-default-rtdb.firebaseio.com/leaves/${leaveId}.json`;
  return this.http.patch(updatedUrl, { status }).pipe(
    tap(() => console.log(`Leave ${leaveId} updated to ${status}`)),
    catchError((error) => {
      return throwError(() => new Error('Failed to update leave status'));
    })
  );
}

}
