import { Component } from "../core/Component.ts";

export type ResultType = "success" | "failure";

export class EndCondition implements Component {
  constructor(public type: ResultType) {}
}
