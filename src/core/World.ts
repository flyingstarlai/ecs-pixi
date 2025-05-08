import { Entity } from "./Entity";
import { System } from "./System";
type Listener = (payload: unknown) => void;

export class World {
  readonly entities: Entity[] = [];
  private systems: System[] = [];
  private prepared = false;

  /* ─── mini event bus ───────────────────────────────────────── */
  private listeners = new Map<string, Listener[]>();

  on(event: string, fn: Listener): void {
    const arr = this.listeners.get(event) ?? [];
    arr.push(fn);
    this.listeners.set(event, arr);
  }

  off(event: string, fn: Listener): void {
    const arr = this.listeners.get(event)?.filter((f) => f !== fn) ?? [];
    this.listeners.set(event, arr);
  }

  emit(event: string, payload?: unknown): void {
    for (const fn of this.listeners.get(event) ?? []) fn(payload);
  }

  createEntity(): Entity {
    const e = new Entity();
    this.entities.push(e);
    return e;
  }

  removeEntity(entOrId: Entity | number): void {
    const id = typeof entOrId === "number" ? entOrId : entOrId.id;
    const idx = this.entities.findIndex((e) => e.id === id);
    if (idx === -1) return;

    const [entity] = this.entities.splice(idx, 1);
    this.emit("entityRemoved", { entity });
  }

  addSystem<S extends System>(sys: S): this {
    sys._attach(this);
    this.systems.push(sys);
    if (this.prepared) {
      Promise.resolve(sys.prepare?.()).then(() => {
        sys.initialize?.();
      });
    }
    return this;
  }

  getSystem<S extends System>(ctor: new (...a: any[]) => S): S | undefined {
    return this.systems.find((s) => s instanceof ctor) as S | undefined;
  }

  findSystem<S extends System = System>(name: string): S | undefined {
    return this.systems.find((s) => s.constructor.name === name) as
      | S
      | undefined;
  }

  /**
   * Removes systems from the world.
   * If you pass a class (constructor), all instances of that class are removed.
   * If you pass an instance, only that exact instance is removed.
   */
  removeSystem(sysOrCtor: System | (new (...args: any[]) => System)): this {
    const isCtor = typeof sysOrCtor === "function";
    this.systems = this.systems.filter((sys) => {
      const match = isCtor ? sys instanceof sysOrCtor : sys === sysOrCtor;
      if (match) {
        sys.finalize?.(); // ← call finalize before dropping
      }
      return !match;
    });
    return this;
  }

  reset(): this {
    // 1) finalize every system
    for (const sys of this.systems) {
      if (sys.finalize) {
        try {
          if (sys.persistent) {
            console.log("persistent true", sys.constructor.name);
            continue;
          }
          console.log("persistent false", sys.constructor.name);
          sys.finalize();
        } catch (err) {
          console.warn(`Error finalizing system ${sys.constructor.name}:`, err);
        }
      }
    }

    // // 2) remove all systems
    this.systems.length = 0;

    // 3) destroy and clear all entities
    //    (if your Entity class has any teardown logic, call it here)
    this.entities.length = 0;

    return this;
  }

  /** Clears all systems out of the world. */
  clearSystems(): this {
    this.systems.length = 0;
    return this;
  }

  /* ───── LIFECYCLE ──────────────────────────────────────────────── */

  async prepare(): Promise<void> {
    for (const s of this.systems) {
      await s.prepare();
      this.prepared = true;
    }
  }

  initialize(): void {
    for (const s of this.systems) s.initialize();
  }

  execute(delta: number): void {
    for (const s of this.systems) s.execute(delta);
  }

  finalize(): void {
    for (const s of this.systems) s.finalize();
  }
}
