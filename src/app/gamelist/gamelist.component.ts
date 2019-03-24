import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../shared/services/user.service';
import {GameService} from '../shared/services/game.service';
import {User} from '../shared/models/user';
import {Game} from '../shared/models/game';
//Websockets
import { Subscription } from "rxjs/Subscription";
import {Message} from '@stomp/stompjs';
import {StompService} from '@stomp/ng2-stompjs';

@Component({
  selector: 'app-gamelist',
  templateUrl: './gamelist.component.html',
  styleUrls: ['./gamelist.component.css']
})
export class GameListComponent  implements OnInit, OnDestroy {
  private _socket_subscription: Subscription;
  games: Game[] = [];
  loading = false;
  error = '';
  private alive: boolean = true;

  constructor(private _router: Router, private _gameService: GameService, private _stompService: StompService) { }

  ngOnInit() {
    // Subscribe to socket /games
    let stomp_subscription = this._stompService.subscribe('/games');
    this._socket_subscription = stomp_subscription.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      // if there are new messages call onMessage
      this.onMessage(msg_body);
    });

    this.getPendingGames();
  }

  join(gameId) {
    this.loading = true;
    this._gameService.joinGame(gameId)
      .subscribe(result => {
        if (result) {
          this.loading = false;
          this.sendMessage(result, 'USER_JOINED');
          this._router.navigate(['/gameLobby', result]);
        }
      },error=>{
        if (error) {
            this.error = error.error;
            this.loading = false;
        }
      });
  }

  getPendingGames() {
    this._gameService.getPending()
      .subscribe(games => {
        if(games) {
          this.games = games;
        }
      },error=>{
        if (error) {
            this.error = error.error;
            this.loading = false;
        }
      });
  }

  //Tell server via socket "Someone entered lobby {gameId}"
  //The server will broadcast the msg to subscribers in /game/{gameId}
  sendMessage(gameId: number, message: string){
    this._stompService.publish('/app/send/lobby/'+gameId+'/message', message);
  }

  //If any message received = new game created -> ask server to update game list
  onMessage(message: string) {
    this.getPendingGames();
  }

  ngOnDestroy() {
    this._socket_subscription.unsubscribe();
    this.alive = false;
  }

}
