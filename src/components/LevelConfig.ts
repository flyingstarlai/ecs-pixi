import { Component } from "../core/Component.ts";

export class LevelConfig implements Component {
  constructor(
    public requiredDonuts: number,
    public requiredKills: number,
    public maxPath: number = 10,
  ) {}
}
