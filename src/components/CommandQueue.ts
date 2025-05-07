import { Component } from "../core/Component";

export enum CommandType {
  MoveRight = "r",
  MoveLeft = "l",
  MoveUp = "u",
  MoveDown = "d",
  Attack = "a",
  Jump = "j",
}

export class CommandQueue implements Component {
  constructor(public queue: CommandType[] = []) {}
}
