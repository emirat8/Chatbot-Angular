import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  token: string | null = "";
  fullName: string | null = "";
  isLogin: string | null | undefined

  ngOnInit() {
    this.checkUrl()
    this.token = localStorage.getItem("token")
    if(this.token){
      const decodedToken:any = jwtDecode(this.token);
      this.fullName = decodedToken.fullname;
      console.log("Full Name : ", this.fullName);
    }
  }

  constructor(private router:Router){}

  checkUrl(){
    return this.isLogin = localStorage.getItem("isLogin")
  }
}
