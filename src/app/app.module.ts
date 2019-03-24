import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {GameComponent} from './game/game.component';
import {MainMenuComponent} from './mainmenu/mainmenu.component';
import {GameListComponent} from './gamelist/gamelist.component';
import {LobbyComponent} from './lobby/lobby.component';
import {LoginComponent} from './login/login.component';
import {CreateUserComponent} from './createuser/createuser.component';
import { ExpeditionBoardComponent } from './game/expeditionboard/expeditionboard.component';
import { BoardComponent } from './game/board/board.component';

import {UserService} from './shared/services/user.service';
import {AuthGuardService} from './shared/services/auth-guard.service';
import {AuthenticationService} from './shared/services/authentication.service';
import {GameService} from './shared/services/game.service';
import {AppService} from './shared/services/app.service';
import {BoardService} from './shared/services/board.service';
import {ExpeditionBoardService} from './shared/services/expeditionboard.service';

import { environment } from '../environments/environment';

import {routing} from './app.routing';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import * as SockJS from 'sockjs-client';
import { DragScrollModule } from 'ngx-drag-scroll';
import { DragulaModule } from 'ng2-dragula';
import { MarketplaceComponent } from './game/marketplace/marketplace.component';

import { ToastrModule, ToastContainerModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


export function socketProvider() {
  return new SockJS(environment.apiUrl+'/socket');
}

const stompConfig: StompConfig = {
      //Server url - with sockJS (automatically choose best option for direct communication)
      url: socketProvider,
      // Headers
      headers: {
        login: 'guest',
        passcode: 'guest'
      },
      //heartbeats
      heartbeat_in: 0, // 0=disabled
      heartbeat_out: 20000, // 20 sec
      // Wait in milliseconds before attempting auto reconnect
      reconnect_delay: 5000,
      // Will log diagnostics on console
      debug: true
    };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreateUserComponent,
    GameListComponent,
    LobbyComponent,
    GameComponent,
    MainMenuComponent,
    ExpeditionBoardComponent,
    BoardComponent,
    MarketplaceComponent

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    routing,
    DragScrollModule,
    DragulaModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ positionClass: 'toastr' }),
    ToastContainerModule
  ],
  providers: [
    GameService,
    AuthenticationService,
    AuthGuardService,
    UserService,
    AppService,
    StompService,
    BoardService,
    ExpeditionBoardService,
     {
       provide: StompConfig,
       useValue: stompConfig
     }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
