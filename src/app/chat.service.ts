import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  post(obj: any): Observable<any> {
    const formData = new FormData();
    formData.append('query_text', obj); // Ganti dengan nama field yang sesuai
    console.log(obj)
    return this.http.post<any>('http://localhost:5601/query', formData);
  }
}
