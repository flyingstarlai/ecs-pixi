import { World } from "./core/World";

import { InputSystem } from "./systems/input/InputSystem.ts";
import { MovementSystem } from "./systems/board/MovementSystem.ts";
import { BoardSystem } from "./systems/board/BoardSystem.ts";
import { CommandProcessorSystem } from "./systems/board/CommandProcessorSystem.ts";
import { UICommandSystem } from "./systems/ui/UICommandSystem.ts";
import { UIButtonSystem } from "./systems/ui/UIButtonSystem.ts";
import { UIPopupSystem } from "./systems/ui/UIPopUpSystem.ts";
import { PixiAppSystem } from "./systems/render/PixiAppSystem.ts";
import { AssetLoadSystem } from "./systems/render/AssetLoaderSystem.ts";
import { BoardRenderSystem } from "./systems/render/BoardRenderSystem.ts";
import { EntityRenderSystem } from "./systems/render/EntityRenderSystem.ts";
import { DeathSystem } from "./systems/board/DeathSystem.ts";
import { CollectionSystem } from "./systems/board/CollectionSystem.ts";
import { DebugSystem } from "./systems/debug/DebugSystem.ts";
import { UIStatsSystem } from "./systems/ui/UIStatsSystem.ts";
import { AttackSystem } from "./systems/board/AttackSystem.ts";
import { EndRatingSystem } from "./systems/board/EndRatingSystem.ts";
import { WorldContainerSystem } from "./systems/render/WorldContainerSystem.ts";
import { ResponsiveSystem } from "./systems/render/ResponsiveSystem.ts";
import { UIContainerSystem } from "./systems/ui/UIContainerSystem.ts";

const world = new World();

world
  .addSystem(new BoardSystem())
  .addSystem(new InputSystem())
  .addSystem(new MovementSystem())
  .addSystem(new PixiAppSystem())
  .addSystem(new AssetLoadSystem())
  .addSystem(new WorldContainerSystem())
  .addSystem(new UIContainerSystem())
  .addSystem(new ResponsiveSystem())
  .addSystem(new BoardRenderSystem())
  .addSystem(new UIStatsSystem())
  .addSystem(new EntityRenderSystem())
  .addSystem(new CollectionSystem())
  .addSystem(new EndRatingSystem())
  .addSystem(new AttackSystem())
  .addSystem(new UICommandSystem())
  .addSystem(new UIButtonSystem())
  .addSystem(new UIPopupSystem())
  .addSystem(new CommandProcessorSystem())
  .addSystem(new DeathSystem())
  .addSystem(new DebugSystem());

await world.prepare();
world.initialize();
