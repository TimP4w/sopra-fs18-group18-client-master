import { Component, OnInit, OnDestroy} from '@angular/core';
import "rxjs/add/operator/takeWhile";
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';
import { UserService } from '../shared/services/user.service';
import { GameService } from '../shared/services/game.service';
import { ExpeditionBoardService } from '../shared/services/expeditionboard.service';
import { User } from '../shared/models/user';
import { Game } from '../shared/models/game';
import { BoardComponent } from './board/board.component';
import { ExpeditionBoardComponent } from './expeditionboard/expeditionboard.component'
import { MarketplaceComponent } from './marketplace/marketplace.component'
import {ExpeditionBoard} from '../shared/models/expeditionboard'
import {Card} from '../shared/models/card'
import {HexSpace} from '../shared/models/hexspace';
//Websockets
import { Subscription } from "rxjs/Subscription";
import {Message} from '@stomp/stompjs';
import {StompService} from '@stomp/ng2-stompjs';
import {DragulaService} from 'ng2-dragula';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent  implements OnInit, OnDestroy  {

  private _socket_subscription: Subscription;
  game: Game;
  error: string = '';
  loading = false;
  boardId: number;
  marketId: number;
  players: User[];
  expeditionBoards: ExpeditionBoard[];
  tempId: number;
  tempList: User[];
  public possibleMoves: HexSpace[];
  gameFinished: boolean  = false;
  gameId: number;
  winners: ExpeditionBoard[];
  winnerNames: User[] = [];
  gameName: string = 'Loading...'
  private alive: boolean = true;
  public gameNotFound = false;
  public updatedState: number = 0;
  public updatedBuyField: number = 0;
  public isCurrentTurn: boolean = false;
  audio = new Audio();
  public gameStopped: boolean = false;

  constructor(private _route: ActivatedRoute, private _router: Router,
    private _authService: AuthenticationService,
    private _gameService: GameService,
    private _stompService: StompService) { }


  ngOnInit() {
    let id = this._route.snapshot.params['id'];
    let stomp_subscription = this._stompService.subscribe('/game/'+id); // subscribe to socket /game/{gameId}
    this._socket_subscription = stomp_subscription.map((message: Message) => {
      return message.body;
    })
    .takeWhile(() => this.alive)
    .subscribe((msg_body: string) => {
      // if there are new messages call onMessage
      this.onMessage(msg_body, id);
    });
    this.getGame(id);
  }

  onMessage(message: string, gameId: number) {
    var msg = JSON.parse(message);
    this.boardId = null;
    this.marketId = null;
    this.gameId = null;

    if(msg.action = 'NEXT_TURN') {
      if(msg.nextPlayer == this._authService.uid) {
        this.checkIfUserTurn(msg.nextPlayer);
        this.audio.src = "../../assets/music/sfx/NFF-gong.wav";
        this.audio.load();
        this.audio.volume = 0.3;
        this.audio.play();
      }
    }
    if(msg.action = 'GAME_FINISHED') {
        this.retrieveFinishedGameData();
      }

    this.getGame(gameId);

  }

  retrieveFinishedGameData() {
      this.getGame(this.gameId);
      if (!this.winners) {
          setTimeout(() => {
          this.retrieveFinishedGameData();
          }, 1000);
      }
  }


  movesUpdated(moves: HexSpace[]) {
    this.possibleMoves = moves;
  }

  stateUpdated() {
    //do something so marketplace detects change
    this.updatedState += 1;
  }

  fieldUpdated() {
      this.updatedBuyField += 1;
  }

  checkIfUserTurn(uid) {
    if(uid == this._authService.uid) {
      this.isCurrentTurn = true;
    } else {
      this.isCurrentTurn = false;
    }
  }

  getGame(id) {
    this._gameService.getGame(id)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          if(result.status == 'PENDING') {
            this.getGame(id);
          }
          else if(result.status == 'RUNNING') {
            this.assignGameVars(result);
          }
          else if (result.status == 'FINISHED') {
            this.finishGame(result);
          }
          else if (result.status == 'STOPPED') {
            this.gameStopped = true;
          }
       }
      }, error => {
        if(error.status == 404) {
          this.gameNotFound = true;
        }
      });
    }

    assignGameVars(result) {
      this.game = result;
      this.boardId = result.board.id;
      this.marketId = result.marketPlace.id;
      this.players = result.players;
      this.gameId = result.id;
      this.expeditionBoards = result.expeditionBoards;
      this.gameName = result.name;
      this.winners = result.winners;
      this.assignColor(result);
      this.checkIfUserTurn(result.players[result.currentPlayer].id);
    }

    finishGame(result) {
      this.assignGameVars(result);
      this.gameFinished = true;
      for (var i = 0; i < this.winners.length; i++) {
        for (var j = 0; j < this.players.length; j++) {
          if (this.players[j].id == this.winners[i].ownerId) {
            this.winnerNames.push(this.players[j]);
          }
        }
      }
    }

  assignColor(game: Game) {
    for (var i = 0; i < game.players.length ; i++) {
      for (var j = 0; j < game.expeditionBoards.length; j++) {
        if (this.players[i].id == game.expeditionBoards[j].ownerId ) {
          this.players[i].color = game.expeditionBoards[j].color;
          if(this.players[i].id == game.expeditionBoards[this.game.currentPlayer].ownerId) {
            this.players[i].isCurrentTurn = true;
          } else {
            this.players[i].isCurrentTurn = false;
          }
        }
      }
    }
  }

  reallyQuit() {
    if (confirm('Do you really want to quit? You won\'t be able to return.')) {
        this.exitGame(this.game.id);
    } else {
    }
  }

  goToMenu() {
    this._router.navigate(['/']);
  }

  exitGame(gameId) {
    this.loading = true; //set loading to true (diplay message or gif)

    this._gameService.exitGame(gameId)
      .takeWhile(() => this.alive)
      .subscribe(result => {
      }, error => {
        if(error.status == 404) {
          this.gameNotFound = true;
        }
      });


    this._router.navigate(['/']);
  }


  //Unsubscribe from socket!
  ngOnDestroy() {
      this.alive = false;
  }
}
