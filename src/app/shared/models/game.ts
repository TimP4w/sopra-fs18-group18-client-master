import { User } from "./user";
import { Board } from "./board";
import { ExpeditionBoard } from "./expeditionboard";
import { Marketplace } from "./marketplace";

export class Game {
  public id: number;
  public name: string;
  public owner: number;
  public numberPlayers: number;
  public status: string;
  public players: User[];
  public map: string;
  public board: Board;
  public expeditionBoards: ExpeditionBoard[];
  public mapId: number;
  public marketPlace: Marketplace;
  public winners: ExpeditionBoard[];
  public currentPlayer: number;

  constructor(){
  }
}
