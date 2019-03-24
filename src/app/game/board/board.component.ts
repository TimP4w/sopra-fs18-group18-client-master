import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange  } from '@angular/core';
import "rxjs/add/operator/takeWhile";
import {Board} from '../../shared/models/board';
import {HexSpace} from '../../shared/models/hexspace';
import {BoardService} from '../../shared/services/board.service';
import { HexRow } from '../../shared/models/hexrow';
import {DragulaService} from 'ng2-dragula';
import { DragScrollModule } from 'ngx-drag-scroll';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  viewProviders: [DragulaService]
})
export class BoardComponent implements OnInit, OnDestroy  {

  @Input() id: number;
  @Input() updatedMoves: HexSpace[];
  possibleMoves: HexSpace[];
  board: Board;
  error: string = '';
  loading = false;
  hexGrid: HexSpace[][];
  dragDisabled: boolean = false;
  userId: number;
  private alive: boolean = true;

  constructor(private _boardService: BoardService, private dragulaService: DragulaService, private toastr: ToastrService) {
    //Generate 49x49 HexGrid
    this.hexGrid = new Array<Array<HexSpace>>();
    for (let y = 0; y < 49; y++) {
      let row: HexSpace[] = new Array<HexSpace>();
      for (let x = 0; x < 37; x++){
        let newHexSpace = new HexSpace;
        newHexSpace.color = 'transparent';
        newHexSpace.power = 0;
        newHexSpace.x = x;
        newHexSpace.y = y;
        row.push(newHexSpace);
      }
      this.hexGrid.push(row);
    }
  }

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = currentUser && currentUser.id;

    this.dragulaService.setOptions('pieces-bag', {
       moves: (el, source, handle, sibling) => !el.classList.contains('nodrag')
    });

    this.dragulaService.drop.subscribe((value) => {
      let pieceId = value[1].id.split("-")[1];
      if(value[2].id.split("-")[0] == 'hex') {
        let hexSpaceId = value[2].id.split("-")[1];
        this.move(pieceId, hexSpaceId);
      } else if (value[2].id.split("-")[0] == 'blockade') {
        let blockadeId = value[2].id.split("-")[1];
        this.winBlockade(pieceId, blockadeId);
      }
    });

    this.dragulaService.drag
      .takeWhile(() => this.alive)
      .subscribe((value) => {
        this.dragDisabled = true;
    });
    this.dragulaService.dragend
      .takeWhile(() => this.alive)
      .subscribe((value) => {
          this.dragDisabled = false;
    });

  }

  //Check for changes
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['id']) {
      //If ID is set, then get the board
      if (changes['id'].currentValue != null) {
        this.getBoard(changes['id'].currentValue)
      }
    }
    if (changes['updatedMoves']) {
      this.possibleMoves = changes['updatedMoves'].currentValue;
      if (this.possibleMoves != null) {
        this.showPossibleMoves();
      }
    }
  }

  move(pieceId: number, hexSpaceId: number ) {
    if(pieceId && hexSpaceId) {
      this.loading = true;
      this.error = '';
      this._boardService.movePiece(this.board.id, pieceId, hexSpaceId)
        .takeWhile(() => this.alive)
        .subscribe(result => {
          this.loading = false;
          if(result) {
            this.board = result;
            this.mapBoard(this.board);
          }
        },error=>{
          if (error) {
              this.getBoard(this.board.id);
              this.toastr.error(error.error);
              this.loading = false;
          }
        });
    }
  }

  winBlockade(pieceId: number, blockadeId: number ) {
    if(pieceId && blockadeId) {
      this.loading = true;
      this.error = '';
      this._boardService.winBlockade(this.board.id, pieceId, blockadeId)
        .takeWhile(() => this.alive)
        .subscribe(result => {
          this.loading = false;
          if(result) {
            this.board = result;
            this.mapBoard(this.board);
          }
        },error=>{
          if (error) {
              this.getBoard(this.board.id);
              this.toastr.error(error.error);
              this.loading = false;
          }
        });
    }
  }

  // Get Board from server
  getBoard(id: number) {
    this.error = '';
    this._boardService.getBoard(id)
      .takeWhile(() => this.alive)
      .subscribe(result => {
        if (result) {
          this.board = result;
          this.mapBoard(this.board);
        } else {
          this.error = 'Error';
          this.loading = false;
        }
      });
  }

  // Set map
  mapBoard(board) {
  //assign existing spaces from server matrix to client matrix
    for (var i = 0; i < board.path.length; i++) {
        if (board.path[i].spaces.length == 0) {
          this.hexGrid[i] = null;
        }
        for (var j = 0; j < board.path[i].spaces.length; j++) {
        //map content of spaces of server matrix to client matrix
          let x = board.path[i].spaces[j].x;
          let y = board.path[i].spaces[j].y;
          this.hexGrid[x][y] = board.path[i].spaces[j];
        }
    }
    this.showPossibleMoves();
  }

  showPossibleMoves() {
    if(this.possibleMoves != null) {
      for(var i = 0; i < this.possibleMoves.length; i++) {
        this.possibleMoves[i].possible = "possible";
        let x = this.possibleMoves[i].x;
        let y = this.possibleMoves[i].y;
        this.hexGrid[x][y] = this.possibleMoves[i];
      }
    }
  }


  ngOnDestroy() {
      this.alive = false;
  }


}
