import { Game } from "./game";
import { HexRow } from "./hexrow";

export class Board {
  public id: number;
  public path: HexRow[];
  public game: Game;
  public name: string;


  constructor(){
  }
}
