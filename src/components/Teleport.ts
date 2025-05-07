import { Component } from "../core/Component.ts";

export class Teleport implements Component {
  constructor(
    public col: number,
    public row: number,
  ) {}
}
