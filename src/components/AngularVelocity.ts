import { Component } from "../core/Component";

/** Degrees-per-second (or rad/s—your call). */
export class AngularVelocity implements Component {
  constructor(public av = 90) {} // 90°/s default spin
}
