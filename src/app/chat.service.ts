import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './environment.developer';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http: HttpClient) { }

  postForStatic(query_text: string): Observable<any> {
    console.log("STATIC")
    const formData = new FormData();
    formData.append('query_text', query_text);
    console.log(query_text); // Menampilkan kedua parameter di konsol

    return this.http.post<any>('http://localhost:5601/queryfromstatic', formData);
  }

  postForDynamic(query_text: string, user_id: string): Observable<any> {
    console.log("DYNAMIC")
    const formData = new FormData();
    formData.append('query_text', query_text);
    formData.append('user_id', user_id);
    console.log(query_text, user_id); // Menampilkan kedua parameter di konsol

    return this.http.post<any>('http://localhost:5601/queryfromdynamic', formData);
  }

  getChatHistory(user_id: string): Observable<any> {
    console.log(user_id); // Menampilkan kedua parameter di konsol
    return this.http.get<any>(`${environment.baseURL}/chat/${user_id}`);
  }

  deleteChatHistory(user_id: string): Observable<any> {
    console.log(user_id); // Menampilkan kedua parameter di konsol
    return this.http.delete<any>(`${environment.baseURL}/chat/delete/${user_id}`);
  }
}
