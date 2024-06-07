import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Employee } from '../../models/Employee';
import { Observable } from 'rxjs';

const url = 'http://localhost:5000/employees';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(name: string): Observable<Employee[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Employee[]>(url, { params });
  }
}
