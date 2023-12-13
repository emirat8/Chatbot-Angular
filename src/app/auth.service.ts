import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from './environment.developer';

@Injectable({
  
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient,private router:Router) {}

  isLoggedIn() {
    return localStorage.getItem("token") ? true:false;
  }
  public auth(data: any): Observable<any> {
    const headers = {
        "Content-Type": "application/json"
    }
    return this.http.post<any>(
        `${environment.baseURL}/login`,
        JSON.stringify(data),
        { headers }
    )
  }

  logout(){
    localStorage.clear();
    this.router.navigate([""]);
  }
  
}
export const authGuard = (): void | boolean => {
  const userService:AuthService = inject(AuthService);
  const router: Router = inject(Router);


  if (userService.isLoggedIn()) {
    return true;
  }

  router.navigate([""]);
}