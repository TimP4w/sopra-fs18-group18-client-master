import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Marketplace } from '../models/marketplace';

@Injectable()
export class MarketplaceService {
  private apiUrl: string;

  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {
    this.apiUrl = environment.apiUrl;
  }

  //TODO check if correct, not sure about the retun line
  getMarketplace(marketId): Observable<Marketplace> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    return this.http.get<Marketplace>(this.apiUrl + '/marketplaces/' + marketId, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }


  sellCard(marketId: number, cardslug: string): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({'Authorization': 'Bearer ' + this.authenticationService.token})
    };
    let params = new HttpParams();
    params = params.set('token', this.authenticationService.token);
    return this.http.post<number>(this.apiUrl + '/marketplaces/' + marketId + '/sell/' + cardslug, params, httpOptions).catch((error: any) => Observable.throw(error || 'Server error'));
  }


}
