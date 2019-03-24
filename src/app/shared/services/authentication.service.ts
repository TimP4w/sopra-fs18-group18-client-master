import {Injectable} from '@angular/core';
import {User} from '../models/user';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { environment } from '../../../environments/environment';
@Injectable()
export class AuthenticationService {
  public token: string;
  public uid: number;
  private apiUrl: string;
  public username: string;

  constructor(private http: HttpClient) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.token = currentUser && currentUser.token;
    this.uid = currentUser && currentUser.id;
    // TODO fill in your heroku-backend URL
    this.apiUrl = environment.apiUrl;
  }

  create(user: User): Observable<User> {
    const bodyString = JSON.stringify({name: user.name, username: user.username});

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<User>(this.apiUrl + '/users', bodyString, httpOptions).map((fetchedUser: User) => {
      if (fetchedUser) {
        return user;
      } else {
        return null;
      }
    })
      .catch((error: any) => Observable.throw(error || 'Server error'));
  }

  login (user: User): Observable<User> {
    const bodyString = JSON.stringify({username: user.username});

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<User>(this.apiUrl + '/users/login', bodyString, httpOptions).map((fetchedUser: User) => {
      if (fetchedUser) {
        // set token property
        this.token = fetchedUser.token;
        this.uid = fetchedUser.id;
        this.username = fetchedUser.username;

        // store username and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify({username: this.username, token: this.token, id: this.uid}));

        // return true to indicate successful login
        return fetchedUser;
      } else {
        // return false to indicate failed login
        return null;
      }
    }) // ...and calling .json() on the response to return data
      .catch((error: any) => Observable.throw(error || 'Server error'));
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null;
    localStorage.removeItem('currentUser');
  }

}
