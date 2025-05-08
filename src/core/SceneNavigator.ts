import { World } from "./World.ts";
import { Scene } from "./Scene.ts";

export type SceneFactory<P> = (params: P) => Scene<P>;

export class SceneNavigator<SM extends object> {
  private readonly world: World;
  private factories = new Map<keyof SM, SceneFactory<SM[keyof SM]>>();
  private current?: Scene<SM[keyof SM]>;

  constructor(world: World) {
    this.world = world;
  }

  register<K extends keyof SM>(name: K, factory: SceneFactory<SM[K]>): void {
    if (this.factories.has(name)) {
      throw new Error(`Scene "${String(name)}" already registered`);
    }
    const fact = factory as unknown as SceneFactory<SM[keyof SM]>;
    this.factories.set(name, fact);
  }

  async switch<K extends keyof SM>(name: K, params: SM[K]): Promise<void> {
    if (this.current && this.current.finalize) {
      this.current.finalize(this.world);
    }

    console.log(`Switching ${String(name)} to ${this.factories.get(name)}`);

    // this.world.reset();

    const factory = this.factories.get(name);
    if (!factory) throw new Error(`No scene: ${String(name)}`);

    const scene = factory(params);
    this.current = scene;

    if (scene.prepare) {
      await scene.prepare(this.world, params);
    }

    // for (const sys of this.world["systems"]) {
    //   if (!sys._hasRunPrepare) {
    //     await sys.prepare();
    //     sys._hasRunPrepare = true;
    //   }
    // }

    if (scene.initialize) {
      scene.initialize(this.world, params);
    }

    // this.world.initialize();
  }

  update(deltaMS: number): void {
    if (this.current?.execute) {
      this.current.execute(this.world, deltaMS);
    }
  }
}
