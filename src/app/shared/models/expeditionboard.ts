import { Card } from "./card";
import { Blockade } from "./blockade";
import { HexSpace } from "./hexspace";
import { Piece } from "./piece";

export class ExpeditionBoard {
    public id: number;
    public gameId: number;
    public ownerId: number;
    public color: string;
    public drawPile: Card[];
    public discardPile: Card[];
    public handPile: Card[];
    public blockadesWon: Blockade[];
    public playedCards: Card[];
    public goldBalance: number;
    public canRemove: number;
    public canMove: boolean;
    public canBuy: number;
    public possibleMoves: HexSpace[];
    public pieces: Piece[];



constructor() {}

}
