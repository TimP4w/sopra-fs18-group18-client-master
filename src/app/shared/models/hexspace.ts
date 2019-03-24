import { Piece } from './piece'
import { Blockade } from './blockade'

export class HexSpace {
  public id: number;
  public color: string;
  public power: number;
  public x: number;
  public y: number;
  public occupiedBy: Piece;
  public blockade: Blockade;
  public possible: string;
  public elDoradoSpace: boolean;
  constructor(){

  }
}
