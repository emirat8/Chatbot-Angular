import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolFunction } from './tool-function-model';
import { environment } from './environment.developer';

@Injectable({
  providedIn: 'root'
})
export class ToolFunctionService {
  private apiUrl = 'http://localhost:8080/api/fungsi'; // Sesuaikan dengan URL API Anda

  constructor(private http: HttpClient) { }

  getToolFunction(id: number): Observable<ToolFunction> {
    return this.http.get<ToolFunction>(`${this.apiUrl}/${id}`);
  }

  createToolFunction(toolFunction: ToolFunction): Observable<ToolFunction> {
    const headers = {
        "Content-Type": "application/json"
    }
    return this.http.post<ToolFunction>(
        `${environment.baseURL}/fungsi`,
        JSON.stringify(toolFunction),
        { headers }
    )
  }

  updateToolFunction(id: number, toolFunction: ToolFunction): Observable<ToolFunction> {
    return this.http.put<ToolFunction>(`${this.apiUrl}/${id}`, toolFunction);
  }

  deleteToolFunction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}