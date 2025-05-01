// src/main.ts
import { World } from "./core/World";

import { InputSystem } from "./systems/InputSystem";
import { MovementSystem } from "./systems/MovementSystem";
import { SpinSystem } from "./systems/SpinSystem";

import { Position } from "./components/Position";
import { Velocity } from "./components/Velocity";
import { Rotation } from "./components/Rotation";
import { AngularVelocity } from "./components/AngularVelocity";
import { PixiRenderSystem } from "./systems/PixiRenderSystem.ts";

const world = new World();

/* Register systems (order still matters) */
world
  .addSystem(new InputSystem())
  .addSystem(new MovementSystem())
  .addSystem(new SpinSystem())
  .addSystem(new PixiRenderSystem());

world
  .createEntity()
  .addComponent(Position, new Position(innerWidth / 2, innerHeight / 2))
  .addComponent(Velocity)
  .addComponent(Rotation)
  .addComponent(AngularVelocity);

await world.prepare();
world.initialize(); // from here Pixi’s ticker calls world.execute()
