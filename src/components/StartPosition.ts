import { Component } from "../core/Component";

export class StartPosition implements Component {
  constructor(
    public col: number,
    public row: number,
  ) {}
}
