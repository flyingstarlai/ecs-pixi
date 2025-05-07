import { Component } from "../core/Component.ts";

export class Scale implements Component {
  constructor(
    public x = 1,
    public y = 1,
  ) {}
}
