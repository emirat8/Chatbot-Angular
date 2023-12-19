import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ToolFunction } from './tool-function-model';
import { environment } from './environment.developer';

@Injectable({
  providedIn: 'root',
})
export class ToolFunctionService {
  constructor(private http: HttpClient) {}

  getToolFunctions(): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}/fungsi`);
  }

  createToolFunction(toolFunction: ToolFunction): Observable<ToolFunction> {
    const headers = {
      'Content-Type': 'application/json',
    };
    return this.http.post<ToolFunction>(
      `${environment.baseURL}/fungsi`,
      JSON.stringify(toolFunction),
      { headers }
    );
  }

  postForFile(filename: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('file', file);
    return this.http.post<any>('http://localhost:5601/upload', formData);
  }

  getToolFunction(id: number): Observable<any> {
    return this.http.get<any>(`${environment.baseURL}/fungsi/${id}`);
  }

  deleteToolFunction(id: number): Observable<void> {
    return this.http.delete<any>(`${environment.baseURL}/fungsi/${id}`);
  }
}
