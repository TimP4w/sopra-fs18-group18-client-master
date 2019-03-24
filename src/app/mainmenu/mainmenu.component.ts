import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../shared/services/authentication.service';
import {UserService} from '../shared/services/user.service';
import {GameService} from '../shared/services/game.service';
import {User} from '../shared/models/user';
import {Game} from '../shared/models/game';
//Websockets
import {StompService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';


@Component({
  selector: 'app-gamelist',
  templateUrl: './mainmenu.component.html',
  styleUrls: ['./mainmenu.component.css']
})
export class MainMenuComponent  implements OnInit {
  games: Game[] = [];
  game: Game;
  loading = false;
  error = '';

  constructor(private _router: Router, private _service: AuthenticationService, private _gameService: GameService, private _stompService: StompService) { }

  ngOnInit() {

  }

  createGame() {
    this.loading = true;
    this._gameService.createGame()
      .subscribe(result => {
        if (result) {
          this.sendMessage("GAME_CREATED");
          this._router.navigate(['/gameLobby', result]);
        } else {
          this.error = 'Error while creating the game.';
          this.loading = false;
        }
      });
  }

  logout() {
    this.loading = true; //set loading to true (diplay message or gif)
    this._service.logout();
    this._router.navigate(['/login']);
  }

  sendMessage(message: string){
    this._stompService.publish('/app/send/games/message', message);
  }

}
