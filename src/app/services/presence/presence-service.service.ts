import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Presence } from '../../models/Presence';

const url = 'http://localhost:5000/presences';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  constructor(private http: HttpClient) {}

  getPresences(): Observable<Presence[]> {
    return this.http.get<Presence[]>(url);
  }

  addPresence(data: any): Observable<any> {
    return this.http.post(url + '/check-in', data);
  }

  checkOut(nik: string): Observable<any> {
    const params = new HttpParams().set('nik', nik);
    return this.http.patch(url + '/check-out', null, { params });
  }
}
