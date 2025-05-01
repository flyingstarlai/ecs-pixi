import { System } from "../core/System";
import { Rotation } from "../components/Rotation";
import { AngularVelocity } from "../components/AngularVelocity";

export class SpinSystem extends System {
  execute(delta: number): void {
    const dt = delta / 1000; // seconds
    for (const e of this.query((q) => q.with(Rotation).with(AngularVelocity))) {
      const rot = e.writeComponent(Rotation);
      const spin = e.readComponent(AngularVelocity)!;
      rot.angle += spin.av * dt;
    }
  }
}
