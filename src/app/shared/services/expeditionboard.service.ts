import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {ExpeditionBoard} from '../models/expeditionboard';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ExpeditionBoardService {
  private apiUrl: string;

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {
    // TODO fill in your heroku-backend URL
    this.apiUrl = environment.apiUrl;
  }

  getExpeditionBoard(gameId): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + gameId + '/getOwn', params);
  }

  discardCard(expBoardId, cardSlug): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + expBoardId + '/discardcard/' + cardSlug , params);
  }

  playCard(expBoardId, cardSlug): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + expBoardId + '/playcard/' + cardSlug , params);
  }

  playActionCard(expBoardId, cardSlug): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + expBoardId + '/playactioncard/' + cardSlug , params);
  }

  removeCard(expBoardId, cardSlug): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + expBoardId + '/removecard/' + cardSlug , params);
  }

  sellCard(expBoardId, cardSlug): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + expBoardId + '/sell/' + cardSlug , params);
  }

  buyCard(expBoardId, cardSlug): Observable<ExpeditionBoard> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<ExpeditionBoard>(this.apiUrl + '/expeditionboards/' + expBoardId + '/buy/' + cardSlug , params);
  }
}
