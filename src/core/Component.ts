/** Marker interface. Your POJO components just `implements Component`. */
export interface Component {}

/** Helper alias for ctor functions so we can key Maps by class. */
export type ComponentType<C extends Component = Component> = new (
  ...args: any[]
) => C;
