import { Component } from "../core/Component.ts";

export class EndRating implements Component {
  constructor(
    public stars: number = 0, // 0–3
  ) {}
}
