import { Component } from "../core/Component";
export class Position implements Component {
  constructor(
    public x = 0,
    public y = 0,
  ) {}
}
