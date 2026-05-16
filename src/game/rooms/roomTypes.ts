export type RoomKind = "lobby" | "cubicles" | "conference" | "records" | "elevator";
export type RoomExit = "north" | "south" | "east" | "west";

export interface RoomDefinition {
  id: string;
  label: string;
  kind: RoomKind;
  center: {
    x: number;
    z: number;
  };
  size: {
    width: number;
    depth: number;
  };
  exits: RoomExit[];
  signLines: [string, string];
}

export interface RoomNetworkDefinition {
  rooms: RoomDefinition[];
  connections: Array<[string, string]>;
}
