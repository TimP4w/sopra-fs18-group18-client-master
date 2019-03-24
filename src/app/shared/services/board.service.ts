import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {Board} from '../models/board';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class BoardService {
  private apiUrl: string;
  private board: Board;

  constructor(private http: HttpClient,
              private authenticationService: AuthenticationService) {

    //TODO fill in your heroku-backend URL
    this.apiUrl = environment.apiUrl;
  }

  getBoard(boardId): Observable<Board> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    return this.http.get<Board>(this.apiUrl + '/boards/'+boardId, httpOptions);
  }

  movePiece(boardId: number, pieceId: number, spaceId: number): Observable<Board> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    params = params.set('pieceId', pieceId.toString());
    params = params.set('spaceId', spaceId.toString());
    return this.http.post<Board>(this.apiUrl + '/boards/'+boardId+'/move', params, httpOptions);

  }

  winBlockade(boardId: number, pieceId: number, blockadeId: number): Observable<Board> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    params = params.set('pieceId', pieceId.toString());
    params = params.set('blockadeId', blockadeId.toString());
    return this.http.post<Board>(this.apiUrl + '/boards/'+boardId+'/winblockade', params, httpOptions);

  }
}
