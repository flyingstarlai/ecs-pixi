import { Component } from "../core/Component";
export class Velocity implements Component {
  constructor(
    public vx = 0,
    public vy = 0,
  ) {}
}
