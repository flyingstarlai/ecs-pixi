import { Component } from "../core/Component.ts";

export enum Dir {
  Up,
  Right,
  Down,
  Left,
}

export class Dead implements Component {
  constructor(
    public dir: Dir,
    public movingThresh = 0.5,
    public movingDownThresh = 0.3,
  ) {}
}
