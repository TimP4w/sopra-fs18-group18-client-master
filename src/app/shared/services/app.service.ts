import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable()
export class AppService {
  private apiUrl: string;

  constructor(private http: HttpClient) {

    //TODO fill in your heroku-backend URL
    this.apiUrl = environment.apiUrl;
  }

  getGroupNumber(): Observable<any> {
    // get group number from api
    return this.http.get(this.apiUrl + '/groupNumber').map(this.extractData);
  }

  private extractData(res: Response) {
        return res;
    }
}
