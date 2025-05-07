import { Component } from "../core/Component.ts";

export class Moving implements Component {
  constructor(
    public readonly startCol: number,
    public readonly startRow: number,
    public readonly dstCol: number,
    public readonly dstRow: number,
    public progress = 0,
    public readonly duration = 0.8, // seconds for 1 tile
  ) {}
}
