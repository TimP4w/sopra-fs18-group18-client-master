/**
 * Created by SaliZumberi on 13.02.2017.
 */

export class User {
  public id: number;
  public token: string;
  public status: string;
  public games: Array<object>;
  public username: string;
  public name: string;
  public color: string;
  public isCurrentTurn: boolean;

  constructor(){
  }
}
