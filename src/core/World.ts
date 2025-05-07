import { Entity } from "./Entity";
import { System } from "./System";
type Listener = (payload: unknown) => void;

export class World {
  readonly entities: Entity[] = [];
  private readonly systems: System[] = [];

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

  addSystem<S extends System>(system: S): this {
    system._attach(this);
    this.systems.push(system);
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

  /* ───── LIFECYCLE ──────────────────────────────────────────────── */

  async prepare(): Promise<void> {
    for (const s of this.systems) await s.prepare();
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
