import { Component } from "../core/Component";

export class GridPosition implements Component {
  constructor(
    public col: number,
    public row: number,
  ) {}
}
