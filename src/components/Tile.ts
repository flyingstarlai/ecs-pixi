import { Component } from "../core/Component";

export type TileKind =
  | "empty"
  | "path"
  | "start"
  | "collectible"
  | "obstacle"
  | "goal";

export class Tile implements Component {
  constructor(
    public readonly col: number,
    public readonly row: number,
    public kind: TileKind = "empty",
  ) {}
}
