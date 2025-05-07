import { Component } from "../core/Component";

export enum Dir {
  Down,
  Left,
  Right,
  Up,
}

export class LastDir implements Component {
  constructor(public dir: Dir = Dir.Down) {}
}
