import { Component } from "../core/Component.ts";

export class WindowSize implements Component {
  constructor(
    public width: number,
    public height: number,
  ) {}
}
