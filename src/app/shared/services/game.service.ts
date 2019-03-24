import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {User} from '../models/user';
import {Game} from '../models/game';
import {Log} from '../models/log';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class GameService {
  private apiUrl: string;
  private game: Game;

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService) {

    //TODO fill in your heroku-backend URL
    this.apiUrl = environment.apiUrl;
  }

  getGame(gameId): Observable<Game> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<Game>(this.apiUrl + '/games/'+gameId, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  getPending(): Observable<Game[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<Game[]>(this.apiUrl + '/games/pending', httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  createGame(): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const bodyString = JSON.stringify({token: this.authenticationService.token});
    return this.http.post<number>(this.apiUrl + '/games', bodyString, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  joinGame(gameId): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const bodyString = JSON.stringify({token: this.authenticationService.token});
    return this.http.post<number>(this.apiUrl + '/games/'+gameId+'/player', bodyString, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  exitGame(gameId): Observable<Game> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<Game>(this.apiUrl + '/games/' + gameId + '/exit', params).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  leaveLobby(gameId): Observable<Game> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<Game>(this.apiUrl + '/games/' + gameId + '/leave', params).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  setNumberPlayers(gameId: number, players: number): Observable<Game> {

    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    params = params.set('players', players.toString());
    return this.http.post<Game>(this.apiUrl + '/games/'+gameId+'/setPlayers', params).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  setMap(gameId: number, mapId: number): Observable<Game> {

    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    params = params.set('mapId', mapId.toString());
    return this.http.post<Game>(this.apiUrl + '/games/'+gameId+'/setMap', params).catch((error: any) => Observable.throw(error || 'Server error'));

  }

  startGame(gameId: number): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const bodyString = JSON.stringify({token: this.authenticationService.token});
    return this.http.post<number>(this.apiUrl + '/games/' + gameId + '/start', bodyString, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  nextTurn(gameId: number): Observable<Game> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const bodyString = JSON.stringify({token: this.authenticationService.token});
    return this.http.post<Game>(this.apiUrl + '/games/' + gameId + '/next', bodyString, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }

  getLog(gameId): Observable<Log[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<Log[]>(this.apiUrl + '/games/'+gameId+ '/logs', httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }
}
