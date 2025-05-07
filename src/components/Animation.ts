import { Component } from "../core/Component";

export enum AnimName {
  idle = "idle",
  walk = "walk",
  jump = "jump",
  attack = "attack",
  dead = "dead",
}

export class Animation implements Component {
  constructor(
    public name: AnimName,
    public frame = 0,
    public fps = 10,
    public playing = true,
  ) {}
}
