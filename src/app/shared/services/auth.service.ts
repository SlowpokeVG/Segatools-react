import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { NotifierService } from 'angular-notifier';
import { isEmpty, get } from 'lodash';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: User;
  private token: string;

  tokenUpdated = new Subject<string>();
  userUpdated = new Subject<{}>();

  constructor(private http: HttpClient, private notify: NotifierService) {
    const token = localStorage.getItem('token');
    if (token) {
      this.token = token;
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  hasUserData() {
    return !isEmpty(this.user);
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
    this.tokenUpdated.next(token);
  }

  isCurrentUser(id) {
    if (!this.hasUserData()) {
      return false;
    }

    return id === this.user._id;
  }

  isRole(role) {
    return get(this.user, 'personas', []).includes(role);
  }

  getToken() {
    return this.token || '';
  }

  fetchUser() {
    console.log('fetch user');
    const headers = new HttpHeaders().set('token', this.token);
    this.http
      .get('/api/users', {
        observe: 'body',
        responseType: 'json',
        headers
      })
      .subscribe(
        (response: { user: User }) => {
          this.user = response.user;
          this.userUpdated.next(this.user);
        },
        () => {
          this.setToken('');
        }
      );
  }

  getUser() {
    console.log('get user');
    return this.user;
  }
}
