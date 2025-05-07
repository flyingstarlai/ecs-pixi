export enum HeroEvent {
  StartMove = "HeroMoving", // progress 0
  ExitTile = "HeroExitTile", // left old tile
  EnterTile = "HeroEnterTile", // snapped to dst tile
}
