import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, concatMap, of, take, tap } from 'rxjs';
import { User } from 'src/app/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  get user(): User | null {
    return this._user.value;
  }
  set user(user: User | null) {
    this._user.next(user);
  }

  get user$(): Observable<User | null> {
    return this._user.asObservable();
  }

  private initialized = false;
  private _user = new BehaviorSubject<User | null>(null);
  get token(): string | null {
    return localStorage.getItem('sudo_token');
  }
  set token(token: string | null) {
    if (token) localStorage.setItem('sudo_token', token);
  }

  constructor(private https: HttpClient) {}

  init(): Observable<User> {
    if (this.initialized) {
      return of(this.user!);
    }

    return this.setUserData().pipe(
        concatMap(() => {
          const headers = new HttpHeaders().append('Authorization', `Bearer ${this.token}`);
          return this.https.get<User>('http://localhost:8000/v1/users/me', { headers });
        }),
        catchError((error) => {
          // request a new token when previous one expires
          if (error.status === 401) {
            localStorage.removeItem('sudo_token');
            return this.init();
          }

          throw error;
        }),
        tap((user: User) => {
          this.user = user;
          this.initialized = true;
        }),
        take(1),
      );
  }

  private setUserData(): Observable<unknown> {
    if (this.token) {
      return of({ headers: this.token });
    }

    return this.https.get<void>('http://localhost:8000/v1/sessions/temp_user', { observe: 'response', })
      .pipe(
        tap(({ headers }) => this.token = headers.get('sudo_token')),
      );
  }
}
