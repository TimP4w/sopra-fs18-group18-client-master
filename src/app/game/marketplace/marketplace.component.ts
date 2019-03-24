import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange, Output, EventEmitter  } from '@angular/core';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';
import "rxjs/add/operator/takeWhile";
import { ActivatedRoute } from '@angular/router';
import { MarketplaceService } from '../../shared/services/marketplace.service';
import {Marketplace} from '../../shared/models/marketplace';
import {Card} from '../../shared/models/card';
import {MarketPile} from '../../shared/models/marketpile';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css'],

  // Credit: coursetro.com - Angular 4 Animation Tutorial by Gary Simon
  animations: [
    trigger('marketplaceAnimation', [

      state('up', style({
        transform: 'translateY(-510px)',
      })),
      state('down', style({
        transform: 'translateY(0px)',
      })),
      transition('up <=> down', animate('0.6s cubic-bezier(.42,0,.58,1)')),
    ]),
  ],

  providers: [MarketplaceService] //WHHYYYY is this here needed? doesnt work without a provider
})
export class MarketplaceComponent implements OnInit, OnDestroy  {

  error: string = '';
  loading = false;

  state: string = 'down';
  @Input() updatedState: number;
  @Input() marketId: number;
  @Input() updatedBuyField: number;
  marketPlace: Marketplace;
  boughtCard: Card[];
  firstRow: MarketPile[];
  secondRow: MarketPile[];
  thirdRow: MarketPile[];
  private alive: boolean = true;

  constructor(private _route: ActivatedRoute, private _marketplaceService: MarketplaceService) { }

  ngOnInit() {
  }

  //Check for changes
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['marketId']) {
      //If ID is set, then get the expeditionBoard
      if (changes['marketId'].currentValue != null) {
        this.getMarket(changes['marketId'].currentValue);

      }
    }
    if (changes['updatedState']) {
      if (this.state == 'down') {
        this.animateMarketplace();
      }
    }
    if (changes['updatedBuyField']) {
        setTimeout(() => {
            this.getMarket(this.marketId);
        }, 20);

      }
  }

  getMarket(marketId) {
    this._marketplaceService.getMarketplace(marketId)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.marketPlace = result;
          this.firstRow = result.marketplaceFrontRow;
          this.secondRow = result.marketplaceMiddleRow;
          this.thirdRow = result.marketplaceBackRow;
        } else {
          this.error = 'Error';
          this.loading = false;
        }
      });
  }

  animateMarketplace() {
    this.state = (this.state === 'up' ? 'down' : 'up');
    var text = document.getElementById("marketButton");
    text.innerText = text.innerText == "Show Marketplace" ? "Hide Marketplace" : "Show Marketplace";
    setTimeout(() => {
      var element = document.getElementById("scrollDown");
      element.scrollTop = element.scrollHeight - element.clientHeight;
      console.log(this.state)
    }, 50);
  }

  ngOnDestroy() {
      this.alive = false;
  }


}
