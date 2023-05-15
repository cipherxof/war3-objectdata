import War3MapW3d from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3d/file";
import War3MapW3u from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3u/file";
import { load, save } from "./container";
import { UnitContainer, UnitProps } from "./generated/units";
import { ItemContainer, ItemProps } from "./generated/items";
import {
  DestructableContainer,
  DestructableProps,
} from "./generated/destructables";
import { DoodadContainer, DoodadProps } from "./generated/doodads";
import {
  AbilityContainer,
  AbilityProps,
  AbilitySpecificProps,
} from "./generated/abilities";
import { BuffContainer, BuffProps } from "./generated/buffs";
import { UpgradeContainer, UpgradeProps } from "./generated/upgrades";
import { saveModificationFile } from "./utils";

export interface ModificationFiles {
  w3u?: War3MapW3u;
  w3t?: War3MapW3u;
  w3b?: War3MapW3u;
  w3d?: War3MapW3d;
  w3a?: War3MapW3d;
  w3h?: War3MapW3u;
  w3q?: War3MapW3d;
  w3uSkin?: War3MapW3u;
  w3tSkin?: War3MapW3u;
  w3bSkin?: War3MapW3u;
  w3dSkin?: War3MapW3d;
  w3aSkin?: War3MapW3d;
  w3hSkin?: War3MapW3u;
  w3qSkin?: War3MapW3d;
}

export class ObjectData {
  units = new UnitContainer();
  items = new ItemContainer();
  destructables = new DestructableContainer();
  doodads = new DoodadContainer();
  abilities = new AbilityContainer();
  buffs = new BuffContainer();
  upgrades = new UpgradeContainer();

  load({ w3u, w3t, w3b, w3d, w3a, w3h, w3q, w3uSkin, w3tSkin, w3bSkin, w3dSkin, w3aSkin, w3hSkin, w3qSkin }: ModificationFiles): void {
    if (w3u) {
      load(this.units, w3u.originalTable, w3u.customTable, UnitProps);
    }

    if (w3uSkin) {
      load(this.units, w3uSkin.originalTable, w3uSkin.customTable, UnitProps);
    }

    if (w3t) {
      load(this.items, w3t.originalTable, w3t.customTable, ItemProps);
    }

    if (w3tSkin) {
      load(this.items, w3tSkin.originalTable, w3tSkin.customTable, ItemProps);
    }

    if (w3b) {
      load(this.destructables, w3b.originalTable, w3b.customTable, DestructableProps);
    }
    
    if (w3bSkin) {
      load(this.destructables, w3bSkin.originalTable, w3bSkin.customTable, DestructableProps);
    }

    if (w3d) {
      load(this.doodads, w3d.originalTable, w3d.customTable, DoodadProps);
    }

    if (w3dSkin) {
      load(this.doodads, w3dSkin.originalTable, w3dSkin.customTable, DoodadProps);
    }

    if (w3a) {
      load(this.abilities, w3a.originalTable, w3a.customTable, AbilityProps, AbilitySpecificProps);
    }

    if (w3aSkin) {
      load(this.abilities, w3aSkin.originalTable, w3aSkin.customTable, AbilityProps, AbilitySpecificProps);
    }

    if (w3h) {
      load(this.buffs, w3h.originalTable, w3h.customTable, BuffProps);
    }

    if (w3hSkin) {
      load(this.buffs, w3hSkin.originalTable, w3hSkin.customTable, BuffProps);
    }

    if (w3q) {
      load(this.upgrades, w3q.originalTable, w3q.customTable, UpgradeProps);
    }

    if (w3qSkin) {
      load(this.upgrades, w3qSkin.originalTable, w3qSkin.customTable, UpgradeProps);
    }
  }

  save(): ModificationFiles {
    const files: ModificationFiles = {};
    
    const w3u = saveModificationFile(War3MapW3u, save(this.units, UnitProps, false));
    if (w3u) {
      files.w3u = w3u;
    }

    const w3uSkin = saveModificationFile(War3MapW3u, save(this.units, UnitProps, true));
    if (w3uSkin) {
      files.w3uSkin = w3uSkin;
    }

    const w3t = saveModificationFile(War3MapW3u, save(this.items, ItemProps, false));
    if (w3t) {
      files.w3t = w3t;
    }

    const w3tSkin = saveModificationFile(War3MapW3u, save(this.items, ItemProps, true));
    if (w3tSkin) {
      files.w3tSkin = w3tSkin;
    }

    const w3b = saveModificationFile(War3MapW3u, save(this.destructables, DestructableProps, false));
    if (w3b) {
      files.w3b = w3b;
    }

    const w3bSkin = saveModificationFile(War3MapW3u, save(this.destructables, DestructableProps, true));
    if (w3bSkin) {
      files.w3bSkin = w3bSkin;
    }

    const w3d = saveModificationFile(War3MapW3d, save(this.doodads, DoodadProps, false));
    if (w3d) {
      files.w3d = w3d;
    }

    const w3dSkin = saveModificationFile(War3MapW3d, save(this.doodads, DoodadProps, true));
    if (w3dSkin) {
      files.w3dSkin = w3dSkin;
    }

    const w3a = saveModificationFile(War3MapW3d, save(this.abilities, AbilityProps, false, AbilitySpecificProps));
    if (w3a) {
      files.w3a = w3a;
    }

    const w3aSkin = saveModificationFile(War3MapW3d, save(this.abilities, AbilityProps, true, AbilitySpecificProps));
    if (w3aSkin) {
      files.w3aSkin = w3aSkin;
    }

    const w3h = saveModificationFile(War3MapW3u, save(this.buffs, BuffProps, false));
    if (w3h) {
      files.w3h = w3h;
    }

    const w3hSkin = saveModificationFile(War3MapW3u, save(this.buffs, BuffProps, true));
    if (w3hSkin) {
      files.w3hSkin = w3hSkin;
    }

    const w3q = saveModificationFile(War3MapW3d, save(this.upgrades, UpgradeProps, false));
    if (w3q) {
      files.w3q = w3q;
    }

    const w3qSkin = saveModificationFile(War3MapW3d, save(this.upgrades, UpgradeProps, true));
    if (w3qSkin) {
      files.w3qSkin = w3qSkin;
    }

    return files;
  }
}
