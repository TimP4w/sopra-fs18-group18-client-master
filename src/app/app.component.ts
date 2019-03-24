import {Component, ViewChild} from '@angular/core';
import {AppService} from './shared/services/app.service';

import {Message} from '@stomp/stompjs';
import {StompService, StompState} from '@stomp/ng2-stompjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  footer: String;
  websocketConnection: String;
  isConnected: boolean = false;

  constructor(private appService: AppService, private _stompService: StompService){ }

  ngOnInit() {

    this.appService.getGroupNumber()
      .subscribe(response => {
        this.footer = 'Sopra FS18 – Group ' + response;
      });

    //TO-DO remove for production!
    this._stompService.state
      .map((state: number) => StompState[state])
      .subscribe((status: string) => {
      this.websocketConnection = status;
      if(status == 'CONNECTED') {
        this.isConnected = true;
      } else {
        this.isConnected = false;
      }
    })
  }



}
