import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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',
    'OpenAI-Beta': 'assistants=v1',
  });

  constructor(private http: HttpClient) { }

  post(query_text: string, thread_id: string): Observable<any> {
    const formData = new FormData();
    formData.append('query_text', query_text);
    formData.append('thread_id', thread_id); // Menambahkan parameter thread_id
    console.log(query_text, thread_id); // Menampilkan kedua parameter di konsol

    return this.http.post<any>('http://localhost:5601/query', formData);
}
}
