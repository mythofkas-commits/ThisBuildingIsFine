import type { RoomNetworkDefinition } from "./roomTypes";

const ROOM_SIZE = {
  width: 8,
  depth: 8
};

export const m2RoomNetwork: RoomNetworkDefinition = {
  rooms: [
    {
      id: "lobby",
      label: "Reception Pending",
      kind: "lobby",
      center: { x: 0, z: 0 },
      size: ROOM_SIZE,
      exits: ["east"],
      signLines: ["RECEPTION", "PENDING"]
    },
    {
      id: "cubicles",
      label: "Open Office, Mostly",
      kind: "cubicles",
      center: { x: 8, z: 0 },
      size: ROOM_SIZE,
      exits: ["west", "east", "north"],
      signLines: ["OPEN OFFICE", "MOSTLY"]
    },
    {
      id: "conference",
      label: "Conference Room 4-ish",
      kind: "conference",
      center: { x: 16, z: 0 },
      size: ROOM_SIZE,
      exits: ["west", "north"],
      signLines: ["CONFERENCE", "4-ISH"]
    },
    {
      id: "records",
      label: "Records That Remember",
      kind: "records",
      center: { x: 8, z: 8 },
      size: ROOM_SIZE,
      exits: ["south", "east"],
      signLines: ["RECORDS", "REMEMBER"]
    },
    {
      id: "elevator",
      label: "Complete Check-Out Elevator",
      kind: "elevator",
      center: { x: 16, z: 8 },
      size: ROOM_SIZE,
      exits: ["west", "south"],
      signLines: ["ELEVATOR", "CONSIDERING"]
    }
  ],
  connections: [
    ["lobby", "cubicles"],
    ["cubicles", "conference"],
    ["cubicles", "records"],
    ["records", "elevator"],
    ["conference", "elevator"]
  ]
};
