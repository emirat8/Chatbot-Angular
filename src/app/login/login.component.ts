import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  username:string="";
  password:string="";
  respons:any;
  
  user = {
    username: this.username,
    password: this.password
  };

  constructor(private authService:AuthService,private route:Router){
  }

  auth(){
    console.log(this.user)
    this.authService.auth(this.user).subscribe(
      (resp: any) => {
        this.respons = resp.data;
        console.log(this.respons.token)
        localStorage.setItem("token",this.respons.token)
        localStorage.setItem("isLogin","1")
        this.route.navigate(['/'])
      }
    )
  }
  public handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}
