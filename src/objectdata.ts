import War3MapW3d from 'mdx-m3-viewer/dist/cjs/parsers/w3x/w3d/file';
import War3MapW3u from 'mdx-m3-viewer/dist/cjs/parsers/w3x/w3u/file';
import { DestructableContainer } from './generated//destructables';
import { DoodadContainer } from './generated/doodads';
import { ItemContainer } from './generated/items';
import { UnitContainer } from './generated/units';
import { saveModificationFile } from './utils';

export interface ModificationFiles {
  w3u?: War3MapW3u,
  w3t?: War3MapW3u,
  w3b?: War3MapW3u,
  w3d?: War3MapW3d,
  w3a?: War3MapW3d,
  w3h?: War3MapW3u,
  w3q?: War3MapW3d,
}

export class ObjectData {
  units = new UnitContainer();
  items = new ItemContainer();
  destructables = new DestructableContainer();
  doodads = new DoodadContainer();
  
  load({ w3u, w3t, w3b, w3d }: ModificationFiles): void {
    if (w3u) {
      this.units.load(w3u.originalTable, w3u.customTable);
    }

    if (w3t) {
      this.items.load(w3t.originalTable, w3t.customTable);
    }

    if (w3b) {
      this.destructables.load(w3b.originalTable, w3b.customTable);
    }

    if (w3d) {
      this.doodads.load(w3d.originalTable, w3d.customTable);
    }
  }

  save(): ModificationFiles {
    const files: ModificationFiles = {};

    const w3u = saveModificationFile(War3MapW3u, this.units.save());
    if (w3u) {
      files.w3u = w3u;
    }

    const w3t = saveModificationFile(War3MapW3u, this.items.save());
    if (w3t) {
      files.w3t = w3t;
    }

    const w3b = saveModificationFile(War3MapW3u, this.destructables.save());
    if (w3b) {
      files.w3b = w3b;
    }
    
    const w3d = saveModificationFile(War3MapW3d, this.doodads.save());
    if (w3d) {
      files.w3d = w3d;
    }

    return files;
  }
}
