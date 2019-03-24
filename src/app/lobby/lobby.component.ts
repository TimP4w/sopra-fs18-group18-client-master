import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {GameService} from '../shared/services/game.service';
import {UserService} from '../shared/services/user.service';
import {User} from '../shared/models/user';
import {Game} from '../shared/models/game';
import {AuthenticationService} from '../shared/services/authentication.service';

//Websockets
import { Subscription } from "rxjs/Subscription";
import {Message} from '@stomp/stompjs';
import {StompService} from '@stomp/ng2-stompjs';

@Component({
  selector: 'app-gamelobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})

export class LobbyComponent  implements OnInit, OnDestroy {
  private _socket_subscription: Subscription;
  game: Game;
  title: String;
  players: User[];
  error = '';
  loading = false;
  isOwner: boolean = false;
  lobbyNotFound: boolean = false;


  playersChosen: {id: number; name: string;};
  mapChosen: {id: number; name: string; difficulty: string; short:string;};
  private alive: boolean = true;


  numPlayers = [
    {id:2, name:'Two Players'},
    {id:3, name:'Three Players'},
    {id:4, name:'Four Players'}
  ];

  map_list = [
    {id:1, name:'Hills of Gold', difficulty:'easy', short:'hog'},
    {id:2, name:'Home Stretch', difficulty:'easy', short:'hs'},
    {id:3, name:'Winding Paths', difficulty:'moderate', short:'wp'},
    {id:4, name:'Serpentine', difficulty:'moderate', short:'se'},
    {id:5, name:'Swamplands', difficulty:'difficult', short:'sw'},
    {id:6, name:"Witch's Cauldron", difficulty:'difficult', short:'wc'},
    {id:7, name:"Mini", difficulty:'extreme', short:'mi'}
  ];

  constructor(
    private _gameService: GameService,
    private _route: ActivatedRoute,
    private _stompService: StompService,
    private _authService: AuthenticationService,
    private changeDetector: ChangeDetectorRef,
    private _router: Router) { }

  ngOnInit() {

    this.title = "Loading..."; // still didn't asked for the name! Display loading

    let id = this._route.snapshot.params['id']; //get game id from URL (path)
    let stomp_subscription = this._stompService.subscribe('/lobby/'+id); // subscribe to socket /lobby/{gameId}
    this._socket_subscription = stomp_subscription.map((message: Message) => {
      return message.body;
    }).subscribe((msg_body: string) => {
      // if there are new messages call onMessage
      this.onMessage(msg_body);
    });
    //Retrieve game info
    this.getGame(id);
  }

  //Everytime a new message is received = someone entered the Lobby
  // therefore update game info
  onMessage(message: string) {
    if (message == 'GAME_EDITED' || message == 'USER_JOINED') {
      this.getGame(this.game.id);
    }
    if (message == 'GAME_STARTED') {
      this._router.navigate(['/game', this.game.id]);
    }
  }

  //get game info from API
  getGame(id) {
    this._gameService.getGame(id)
      .subscribe(result => {
        if (result) {
          this.game = result;
          this.players = result.players;
          this.title = result.name;
          this.mapChosen = this.map_list[result.mapId - 1];
          this.playersChosen = this.numPlayers[result.numberPlayers - 2];
          // Check that user is owner
          if (this._authService.uid == this.game.owner) {
            this.isOwner = true;
          }
          if(result.status == "RUNNING") {
            this._router.navigate(['/game', result.id]);
          }
        }
      },error=>{
        if (error) {
          if(error.status == 404) {
            this.lobbyNotFound = true;
          }
            this.error = error.error;
            this.loading = false;
        }
      });
  }

  onSelectPlayerNr() {
    this.loading = true;
    this._gameService.setNumberPlayers(this.game.id, this.playersChosen.id)
      .subscribe(result => {
        if (result) {
          this.game = result;
          this.sendMessage(this.game.id, "GAME_EDITED");
          this.loading = false;
        }
      },error=>{
          if (error) {
              this.error = error.error;
              this.loading = false;
          }
        });
    }

  onSelectMap() {
    this.loading = true;
    this._gameService.setMap(this.game.id, this.mapChosen.id)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.game = result;
          this.sendMessage(this.game.id, "GAME_EDITED");
          this.loading = false;
        }
      },error=>{
          if (error) {
              this.error = error.error;
              this.loading = false;
          }
        });
  }


  sendMessage(gameId: number, message: string){
    this._stompService.publish('/app/send/lobby/'+gameId+'/message', message);
    this._stompService.publish('/app/send/games/message', message);
  }


  // Start Game
  startGame() {
    this._gameService.startGame(this.game.id)
      .takeWhile(() => this.alive)
      .subscribe(result => {
      },error=>{
        if (error) {
            this.error = error.error;
            this.loading = false;
        }
      });
  }

  leaveLobby(gameId) {
    this.loading = true; //set loading to true (diplay message or gif)
    var canNavigate = true;
    this._gameService.leaveLobby(gameId)
      .takeWhile(() => this.alive)
      .subscribe(result => {
      }, error => {
        if(error) {
          this.error = error.error;
          this.loading = false;
        }
      });

      if(this.game.owner != this._authService.uid) {
        this._router.navigate(['/']);
      }
  }

  goToMenu() {
    this._router.navigate(['/']);
  }

//Unsubscribe from socket!
  ngOnDestroy() {
    this._socket_subscription.unsubscribe();
    this.alive = false;
  }
}
