import Modification from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3u/modification";
import ModificationTable from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3u/modificationtable";
import ModifiedObject from "mdx-m3-viewer-th/dist/cjs/parsers/w3x/w3u/modifiedobject";
import { generateId, Prop, pushArray, tsToWar3, war3ToTS } from "./utils";

export interface IDs {
  oldId: string;
  newId: string;
}

interface Objects<T> {
  game: Readonly<{ [key: string]: Readonly<T> }>;
  map: { [key: string]: T };
}



function getProp(id: string, props: Prop[]): Prop | undefined {
  for (const prop of props) {
    if (prop.id === id) {
      return prop;
    }
  }

  return;
}

export function objectLoader<T extends IDs>(
  object: T,
  modifications: Modification[],
  props: Prop[],
  specificProps?: { [key: string]: Prop[] }
) {
  for (const modification of modifications) {
    const { id, value } = modification;
    let prop = getProp(id, props);

    if (!prop && specificProps) {
      const specific = specificProps[object.oldId];

      if (!specific) {
        throw Error(`INVALID OLD ID FOR ABILITY ${object.oldId} ${id}`);
      }

      prop = getProp(id, specific);
    }

    if (!prop) {
      throw Error(
        `Failed to get an Ability prop: ${object.oldId}:${object.newId} => ${id}`
      );
    }

    if(modification.levelOrVariation > 1) {
      if(!(<any>object).levelProps[modification.levelOrVariation]) {
        (<any>object).levelProps[modification.levelOrVariation] = {};
      }
      (<any>object).levelProps[modification.levelOrVariation][prop.name] = war3ToTS(prop.type, value);

    } else {
      // A neccessary evil.
      (<any>object)[prop.name] = war3ToTS(prop.type, value);
    }
  }
}

export function objectSaver<T extends IDs>(
    gameObject: T,
    object: T,
    baseProps: Prop[],
    skin: boolean,
    specificProps?: { [key: string]: Prop[] }
): Modification[] {
  const modifications: Modification[] = [];

  const processProps = (sourceObj: any, targetObj: any, props: Prop[], level?: number) => {
    for (const prop of props) {
      if (sourceObj[prop.name] !== targetObj[prop.name]) {
        if (skin && prop.netsafe !== "true") {
          continue;
        } else if (!skin && prop.netsafe === "true") {
          continue;
        }

        const modification = tsToWar3(prop, targetObj[prop.name]);
        if(level) {
          modification.levelOrVariation = level;
        }
        modification.dataPointer = prop.dataPointer || 0;

        modifications.push(
            modification
        );
      }
    }
  };
  const allProps = [...baseProps, ...(specificProps?.[gameObject.oldId] || [])]
  // Process properties
  processProps(gameObject, object, allProps);


  // Process levelProps if they exist
  if ('levelProps' in object) {
    for (const level in (<any>object).levelProps) {
      const levelObjectProps = (<any>object).levelProps[level];
      const gameObjectProps = (<any>gameObject).levelProps?.[level] || {};
      // const gameObjectLevelProps = gameObject.levelProps?.[level] || {};

      // Assuming levelObjectProps has the same structure as baseProps
      processProps(gameObjectProps, levelObjectProps, allProps, Number(level));
    }
  }

  return modifications;
}

function loadObject<T extends IDs, E>(
  objects: Objects<T>,
  oldId: string,
  newId: string,
  modifications: Modification[],
  props: Prop[],
  specificProps?: { [key: string]: Prop[] }
) {
  let objectId;
  if (newId === "\0\0\0\0") {
    objectId = oldId;
  } else {
    objectId = newId;
  }

  const gameObject = objects.game[oldId];

  if (!gameObject) {
    throw Error(`Failed to load an object: ${oldId}`);
  }

  const mapObject = JSON.parse(JSON.stringify({ ...gameObject, oldId, newId }));

  objectLoader(mapObject, modifications, props, specificProps);

  if (objects.map[objectId]) {
    for (const [key, value] of Object.entries(mapObject)) {
      if ((objects.game[oldId] as any)[key] !== value) {
        (objects.map[objectId] as any)[key] = value;
      }
    }
  } else {
    objects.map[objectId] = mapObject;
  }
}

export function load<T extends IDs, E>(
  objects: Objects<T>,
  originalTable: ModificationTable,
  customTable: ModificationTable,
  props: Prop[],
  specificProps?: { [key: string]: Prop[] }
): void {
  for (const { oldId, newId, modifications } of originalTable.objects) {
    loadObject(objects, oldId, newId, modifications, props, specificProps);
  }

  for (const { oldId, newId, modifications } of customTable.objects) {
    loadObject(objects, oldId, newId, modifications, props, specificProps);
  }
}

export function save<T extends IDs, E>(
  objects: Objects<T>,
  props: Prop[],
  skin: boolean,
  specificProps?: { [key: string]: Prop[] }
): { original: ModifiedObject[]; custom: ModifiedObject[] } {
  const original: ModifiedObject[] = [];
  const custom: ModifiedObject[] = [];

  for (const object of Object.values(objects.map)) {
    const gameObject = objects.game[object.oldId];

    if (!gameObject) {
      throw Error(
        `Tried to save the modifications of an object with an invalid oldId: ${object.oldId} (newId=${object.newId})`
      );
    }

    const modifications = objectSaver(gameObject, object, props, skin, specificProps);

    if (modifications.length) {
      const modifiedObject = new ModifiedObject();

      modifiedObject.oldId = object.oldId;
      modifiedObject.newId = object.newId;
      pushArray(modifiedObject.modifications, modifications);

      if (object.newId === "\0\0\0\0") {
        original.push(modifiedObject);
      } else {
        custom.push(modifiedObject);
      }
    }
  }

  return { original, custom };
}

export abstract class Container<T extends IDs> {
  /**
   * Game objects.
   */
  abstract game: Readonly<{ [key: string]: Readonly<T> }>;

  /**
   * Map objects.
   */
  map: { [key: string]: T } = {};

  /**
   * Get an existing object.
   *
   * If the object isn't in the map data but is in the game data, it will be copied to the map data.
   */
  get(id: string): T | undefined {
    let object = this.map[id];

    if (!object) {
      const gameObject = this.game[id];

      // If this object exists in the game data, copy it and add it to the map data in case it is modified by the caller.
      if (gameObject) {
        object = JSON.parse(JSON.stringify({ ...gameObject, oldId: id, newId: "\0\0\0\0" }))

        this.map[id] = object;
      }
    }

    return object;
  }

  /**
   * Copy an existing object.
   *
   * The source object can either be given as a string ID, or an object returned from previous get/copy calls.
   *
   * If newId is supplied, it will be used as the new object's ID, otherwise a random ID is generated.
   *
   * If a random ID is generated, its first letter will be capitalized if the base ID's first letter is capitalized, to support hero units.
   */
  copy(baseIdOrObject: string | T, newId?: string): T | undefined {
    let baseId: string;
    let baseObject;

    if (typeof baseIdOrObject === "string") {
      baseId = baseIdOrObject;

      // Is this object from the map?
      baseObject = this.map[baseId];

      // Is this object from the game?
      if (!baseObject) {
        baseObject = this.game[baseId];
      }
    } else {
      baseId = baseIdOrObject.oldId;
      baseObject = baseIdOrObject;
    }

    if (!baseObject) {
      throw Error(`Tried to copy an object that does not exist: ${baseId}`);
    }

    // If an ID was't given, generate one.
    if (!newId) {
      newId = generateId(this.map, baseId[0] === baseId[0].toUpperCase());
    }

    // Copy the object.
    const object = JSON.parse(JSON.stringify({ ...baseObject, oldId: baseId, newId }));

    this.map[newId] = object;

    return object;
  }

  /**
   * Checks if the map contains an buff with the given ID.
   *
   * Does not the game data.
   */
  has(id: string): boolean {
    return !!this.map[id];
  }
}
