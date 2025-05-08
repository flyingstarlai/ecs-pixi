import { World } from "./core/World";

import { PixiAppSystem } from "./systems/render/PixiAppSystem.ts";
import { PreloadScene } from "./scenes/PreloadScene.ts";
import { SceneNavigator } from "./core/SceneNavigator.ts";
import { LevelSelectScene } from "./scenes/LevelSelectScene.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { ScenesMap } from "./scenes";
import { WorldContainerSystem } from "./systems/render/WorldContainerSystem.ts";
import { UIContainerSystem } from "./systems/ui/UIContainerSystem.ts";
import { ResponsiveSystem } from "./systems/render/ResponsiveSystem.ts";

async function bootstrap() {
  // 1) Create the ECS world with only the Pixi renderer
  const world = new World()
    .addSystem(new PixiAppSystem())
    .addSystem(new ResponsiveSystem())
    .addSystem(new WorldContainerSystem())
    .addSystem(new UIContainerSystem());

  await world.prepare();
  world.initialize();

  // 2) Create & register all your scenes
  const nav = new SceneNavigator<ScenesMap>(world);
  nav.register("Preload", () => new PreloadScene(nav));
  nav.register("LevelSelect", () => new LevelSelectScene(nav));
  nav.register("Game", ({ levelId }) => new GameScene(nav, { levelId }));

  // 3) Start in the Preload scene
  await nav.switch("Preload", undefined);

  // 4) Drive both scene‐ and ECS‐logic from one ticker
  const app = world.getSystem(PixiAppSystem)!.app;
  app.ticker.add(({ deltaMS }) => {
    nav.update(deltaMS); // calls currentScene.execute(...)
    world.execute(deltaMS); // runs all your registered systems
  });
}

bootstrap().catch((err) => {
  console.log(err);
});
