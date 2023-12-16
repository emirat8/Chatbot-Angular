import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  withTemplate: boolean = true

  ngOnInit() {
    if (window.location.href.includes("/dashboard")){
      this.withTemplate = false
    }
    this.checkUrl()
    this.token = localStorage.getItem("token")
    if(this.token){
      const decodedToken:any = jwtDecode(this.token);
      this.fullName = decodedToken.fullname;
      console.log("Full Name : ", this.fullName);
    }
  }

  checkUrl(){
    return this.isLogin = localStorage.getItem("isLogin")
  }
}
