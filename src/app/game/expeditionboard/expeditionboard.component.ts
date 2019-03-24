import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange, Output, EventEmitter  } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, query, stagger, animateChild } from '@angular/animations';
import "rxjs/add/operator/takeWhile";
import { ActivatedRoute } from '@angular/router';
import {HexSpace} from '../../shared/models/hexspace';
import { ExpeditionBoardService } from '../../shared/services/expeditionboard.service';
import { GameService } from '../../shared/services/game.service';
import { ExpeditionBoard } from '../../shared/models/expeditionboard';
import { Card } from '../../shared/models/card';
import {DragulaService} from 'ng2-dragula';
import { Piece } from '../../shared/models/piece';
import { Game } from '../../shared/models/game';
import { Log } from '../../shared/models/log';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expeditionboard',
  templateUrl: './expeditionboard.component.html',
  styleUrls: ['./expeditionboard.component.css'],

  animations: [
    trigger('playCardAnimation', [
      state("onPlayCardPile", style({'z-index' : '-1', transform: 'scale(1)'})),
      state("onPlayedCardsPile", style({'z-index' : '500', top: 500, left: 1150, transform: 'scale(0.5)'})),
      transition('onPlayCardPile => onPlayedCardsPile', animate('0.8s cubic-bezier(.42,0,.58,1)')),
    ]),

    trigger('playActioncardAnimation', [
      state("onPlayActioncardPile", style({'z-index' : '-1'})),
      state("onDiscardPile", style({'z-index' : '500', top: 532, left: 845})),
      transition('onPlayActioncardPile => onDiscardPile', animate('0.8s cubic-bezier(.42,0,.58,1)')),
    ]),

    trigger('sellCardAnimation', [
      state("sellState1", style({'opacity' : '0'})),
      state("sellState2", style({'opacity' : '1', 'z-index' : '500', top: 532, left: 745.5})),
      transition('sellState1 => sellState2', animate('0.8s cubic-bezier(.42,0,.58,1)')),
    ]),
  ],
})

export class ExpeditionBoardComponent implements OnInit, OnDestroy {

  @Input() gameId: number;
  error: string = '';
  loading = false;
  cardToMove1: string;
  cardToMove2: string;
  cardToMove3: string;
  state1: string = 'onPlayCardPile';
  state2: string = 'onPlayActioncardPile';
  state3: string = 'sellState1';
  noTimeout: boolean = true;
  expBoard: ExpeditionBoard;
  handPile: Card[];
  drawPile: Card[];
  discardPile: Card[];
  playedCardsPile: Card[];
  pieces: Piece[];
  goldBalance: number;
  logVisible: boolean = true;
  logs: Log[];
  actionCards: string[] = ['compass', 'travellog', 'scientist', 'native', 'cartographer', 'transmitter'];
  @Output() possibleMovesUpdated = new EventEmitter<HexSpace[]>();
  @Output() marketStateUpdated = new EventEmitter();
  @Output() buyFieldUpdated = new EventEmitter();
  private alive: boolean = true;
  isPlayingCard: boolean = false;
  isActionCard: boolean = false;

  constructor(private _route: ActivatedRoute,
    private _expboardService: ExpeditionBoardService,
    private _gameService: GameService,
    private dragulaService: DragulaService,
    private toastr: ToastrService) {

  }

  ngOnInit() {
    this.dragulaService.setOptions('cards-bag', {
      accepts: this.canDrop
    });
    this.dragulaService.drop
     .takeWhile(() => this.alive)
     .subscribe((value) => {
        let cardSlug = value[1].className.split(' ')[1];
        let action = value[2].className;
        let cameFrom = value[3].className;
        this.onDrop(action, cardSlug, cameFrom);
        this.isActionCard = false;
    });
    this.dragulaService.drag
     .takeWhile(() => this.alive)
     .subscribe((value) => {
        let cardSlug = value[1].className.split(' ')[1];

        let actionCards = ['scientist', 'transmitter', 'travellog', 'cartographer', 'native', 'compass'];

        if(actionCards.indexOf(cardSlug) !== -1) {
          this.isActionCard = true;
        } else {
          this.isActionCard = false;
        }

        let cameFrom = value[2].className;
        if(cameFrom == 'handpile') {
          this.isPlayingCard = true;
        }
    });
    this.dragulaService.dragend
     .takeWhile(() => this.alive)
     .subscribe((value) => {
       this.isPlayingCard = false;
    });


  }

  //Check for changes
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['gameId']) {
      //If ID is set, then get the expeditionBoard
      if (changes['gameId'].currentValue != null) {
        this.getExpBoard(changes['gameId'].currentValue);
        this.getLogs(changes['gameId'].currentValue);

        // scroll log to bottom
        setTimeout(() => {
          var element = document.getElementById("scrollDown2");
          element.scrollTop = element.scrollHeight - element.clientHeight;
        }, 50);
      }
    }
  }

  canDrop(el, target, source, sibling) {
    if(source.className == 'handpile' ) {
      if(target.className == 'discard' ||
         target.className == 'playcard' ||
         target.className == 'playactioncard' ||
         target.className == 'sellfield' ||
         target.className == 'remove') {
           return true;
         }
    } else if(source.className == 'marketpile') {
      if(target.className == 'buyfield') {
        return true;
      }
    }
    return false;
  }

  updatePossibleMoves(moves: HexSpace[]) {
      this.possibleMovesUpdated.emit(moves);
  }

  getExpBoard(gameId) {
    if(gameId == null) {
      return;
    }
    this._expboardService.getExpeditionBoard(gameId)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.expBoard = result;
          this.handPile = result.handPile;
          this.drawPile = result.drawPile;
          if (this.noTimeout) {
            this.updateDiscPlay();
          }
          this.goldBalance = result.goldBalance;
          this.pieces = result.pieces;
          this.updatePossibleMoves(result.possibleMoves);
          this.loading = false;
        }
      },error=>{
        if (error) {
            this.toastr.error(error.error);
            this.loading = false;
        }
      });
  }

  updateDiscPlay() {
    this.playedCardsPile = this.expBoard.playedCards;
    this.discardPile = this.expBoard.discardPile.reverse();
  }


  private onDrop(action, cardSlug, cameFrom) {
    if(cameFrom == 'handpile') {
      if(action == 'discard') {
        this.discardCard(cardSlug);
      } else if(action == 'playcard') {
        this.playCard(cardSlug);
      } else if (action == 'playactioncard') {
        this.playActionCard(cardSlug);
      } else if (action == 'remove') {
        this.removeCard(cardSlug);
      } else if (action == 'sellfield') {
        this.sellCard(cardSlug);
      } else {
        this.getExpBoard(this.gameId);
      }
    } else if (cameFrom == 'marketpile') {
      if (action == 'buyfield') {
        this.buyCard(cardSlug);
        var bought = document.getElementById("buyfield");
        while(bought.firstChild) {
            bought.removeChild(bought.firstChild);
        }
        this.buyFieldUpdated.emit();
      } else {
        this.getExpBoard(this.gameId);
      }
    }
  }


  private playActionCard(cardSlug) {
    this._expboardService.playActionCard(this.expBoard.id, cardSlug)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          if (this.actionCards.some(i => cardSlug === i)) {
            this.updatePossibleMoves(result.possibleMoves);
            this.toastr.success('Action Played');
            this.getExpBoard(this.gameId);

            // animate, reset state
            this.noTimeout = false;
            setTimeout(() => {
              this.animatePlayActioncard(cardSlug);
            }, 50);
            setTimeout(() => {
              this.playedCardsPile = this.expBoard.playedCards;
              this.discardPile = this.expBoard.discardPile.reverse();
              this.noTimeout = true;
              this.state2 = 'onPlayActioncardPile';
            }, 1000);
          } else {
            this.toastr.error('This card has no action.');
            this.getExpBoard(this.gameId);
          }
        }
      },error=>{
        if (error) {
          this.toastr.error(error.error);
          this.loading = false;
          this.getExpBoard(this.gameId);
        }
      });
  }

  animatePlayActioncard(cardSlug) {
    this.cardToMove2 = cardSlug;
    this.state2 = 'onDiscardPile';
  }


  private playCard(cardSlug) {
    this._expboardService.playCard(this.expBoard.id, cardSlug)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.updatePossibleMoves(result.possibleMoves);
          this.toastr.success('Card Played');
          this.getExpBoard(this.gameId);

          // animate, reset state
          this.noTimeout = false;
          setTimeout(() => {
            this.animatePlayCard(cardSlug);
          }, 50);
          setTimeout(() => {
            this.playedCardsPile = this.expBoard.playedCards;
            this.discardPile = this.expBoard.discardPile.reverse();
            this.noTimeout = true;
            setTimeout(() => {
              this.state1 = 'onPlayCardPile';
            }, 50);
          }, 1000);
        }
      },error=>{
        if (error) {
            //this.error = error.error;
            this.toastr.error(error.error);
            this.loading = false;
            this.getExpBoard(this.gameId);
        }
      });
  }

  animatePlayCard(cardSlug) {
    this.cardToMove1 = cardSlug;
    this.state1 = 'onPlayedCardsPile';
  }


  private removeCard(cardSlug) {
      this._expboardService.removeCard(this.expBoard.id, cardSlug)
       .takeWhile(() => this.alive)
      .subscribe(result => {
          this.toastr.success('Card Removed');
          this.getExpBoard(this.gameId);
      },error=>{
        if (error) {
            this.toastr.error(error.error);
            this.loading = false;
        }
      });
  }

  private discardCard(cardSlug) {
    this._expboardService.discardCard(this.expBoard.id, cardSlug)
      .takeWhile(() => this.alive)
      .subscribe(result => {
          this.toastr.success('Card Discarded');
          this.getExpBoard(this.gameId);
      },error=>{
        if (error) {
            this.toastr.error(error.error);
            this.loading = false;
        }
      });
  }

  private sellCard(cardSlug) {
    this._expboardService.sellCard(this.expBoard.id, cardSlug)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.toastr.success('Card Sold, you now have ' + result + ' coins');
          this.getExpBoard(this.gameId);

          // animate, reset state
          this.noTimeout = false;
          this.animateSellCard(cardSlug);
          setTimeout(() => {
            this.playedCardsPile = this.expBoard.playedCards;
            this.discardPile = this.expBoard.discardPile.reverse();
            this.noTimeout = true;
            this.state3 = 'sellState1';
          }, 750);
        }
      }, error=>{
        if (error) {
            this.toastr.error(error.error);
            this.loading = false;
            this.getExpBoard(this.gameId);
        }
      });
  }

  animateSellCard(cardSlug) {
    this.cardToMove3 = cardSlug;
    this.state3 = 'sellState2';
  }

  private buyCard(cardSlug) {
    this._expboardService.buyCard(this.expBoard.id, cardSlug)
      .takeWhile(() => this.alive)
      .subscribe(result => {
          this.toastr.success('Card Bought');
          this.getExpBoard(this.gameId);
          this.marketStateUpdated.emit();

          // animate, reset state
          this.noTimeout = false;
          this.animateSellCard(cardSlug);
          setTimeout(() => {
            this.playedCardsPile = this.expBoard.playedCards;
            this.discardPile = this.expBoard.discardPile.reverse();
            this.noTimeout = true;
            this.state3 = 'sellState1';
          }, 750);
      },
        error=>{
        if (error) {
            this.toastr.error(error.error);
            this.loading = false;
        }
      });
  }

  nextTurn() {
    this._gameService.nextTurn(this.expBoard.gameId)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if(result) {
          this.toastr.success('Turn finished');
          this.getExpBoard(this.gameId);
          this.marketStateUpdated.emit();
        }
      },
        error=>{
          if (error) {
              this.toastr.error(error.error);
              this.loading = false;
          }
      });
  }

  showLog() {
    this.logVisible = true;
  }
  showStats() {
    this.logVisible = false;
  }

  getLogs(gameId) {
    this._gameService.getLog(gameId)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.logs = result;
        }
      }, error=>{
          if (error) {
              this.toastr.error(error.error);
              this.loading = false;
          }
      });
  }


  ngOnDestroy() {
    this.dragulaService.destroy('cards-bag');
    this.alive = false;
  }
}
