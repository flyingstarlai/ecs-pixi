import { FolderApi, Pane } from "tweakpane";
import { System } from "../../core/System.ts";
import {
  DonutTag,
  GoalTag,
  HeroTag,
  MonsterTag,
  TileTag,
} from "../../components/Tags.ts";
import { Entity } from "../../core/Entity.ts";
import { CommandQueue } from "../../components/CommandQueue.ts";

export class DebugSystem extends System {
  private pane!: Pane;
  private enabled = false;
  private categoryFolders = new Map<string, FolderApi>();
  private entityFolders = new Map<number, FolderApi>();
  // Map entityId → Map of componentName → FolderApi
  private componentFolders = new Map<number, Map<string, FolderApi>>();
  private debugCommand = {
    queue: "",
  };
  async prepare() {
    this.enabled = window.location.hash === "#debug";
    if (!this.enabled) return;
    this.pane = new Pane({ title: "Debug", expanded: true });
    // Object.assign(this.pane.element.style, {
    //   top: "10px",
    //   right: "10px",
    //   zIndex: "9999",
    //   maxHeight: "80vh",
    //   minWidth: "20vh",
    //   overflow: "auto",
    // });
  }

  execute(): void {
    if (!this.enabled) return;

    // 1) Handle entities: add new, remove gone
    const currentIds = new Set(this.world.entities.map((e) => e.id));
    // Remove disposed entities
    for (const [id, folder] of this.entityFolders) {
      if (!currentIds.has(id)) {
        folder.dispose();
        this.entityFolders.delete(id);
        this.componentFolders.delete(id);
      }
    }
    for (const ent of this.world.entities) {
      if (ent.has(CommandQueue)) {
        const cmd = ent.readComponent(CommandQueue)!;
        this.debugCommand.queue = cmd.queue.join(" ");
      }

      const id = ent.id;
      // Add entity folder if new

      if (!this.entityFolders.has(id)) {
        const category = this.getCategory(ent);
        let catFolder = this.categoryFolders.get(category);
        if (!catFolder) {
          catFolder = this.pane.addFolder({ title: category, expanded: false });
          this.categoryFolders.set(category, catFolder);
        }
        const entFolder = catFolder.addFolder({
          title: `Entity ${id}`,
          expanded: false,
        });
        this.entityFolders.set(id, entFolder);
        this.componentFolders.set(id, new Map());
      }

      // 2) For each entity, sync component folders
      const entFolder = this.entityFolders.get(id)!;
      const compMap = this.componentFolders.get(id)!;

      // collect current component names
      const currNames = new Set<string>();
      for (const { ctor, instance } of ent.listComponents()) {
        const name = ctor.name;
        currNames.add(name);
        // add new component folder
        if (!compMap.has(name)) {
          const compFolder = entFolder.addFolder({
            title: name,
            expanded: false,
          });

          if (instance instanceof CommandQueue) {
            compFolder.addBinding(this.debugCommand, "queue", {
              view: "text",
            });
          } else {
            const instRec = instance as Record<string, unknown>;
            for (const key of Object.keys(instRec)) {
              const val = instRec[key];
              if (["number", "boolean", "string"].includes(typeof val)) {
                compFolder.addBinding(instRec, key);
              }
            }
          }
          compMap.set(name, compFolder);
        }
      }
      // remove component folders that no longer exist
      for (const [name, folder] of Array.from(compMap.entries())) {
        if (!currNames.has(name)) {
          folder.dispose();
          compMap.delete(name);
        }
      }
    }

    // 3) Refresh pane
    this.pane.refresh();
  }

  /** Categorize entities by tag components */
  private getCategory(ent: Entity): string {
    if (ent.has(HeroTag)) return "Hero";
    if (ent.has(MonsterTag)) return "Monster";
    if (ent.has(DonutTag)) return "Donut";
    if (ent.has(GoalTag)) return "Goal";
    if (ent.has(TileTag)) return "Board";
    return "Other";
  }
}
