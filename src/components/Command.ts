import { Component } from "../core/Component.ts";

export class Command implements Component {
  constructor(
    public indexToPlay: number = 0,
    public pending?: number,
  ) {}
}
