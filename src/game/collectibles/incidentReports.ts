import type { IncidentReportDefinition } from "./collectibleTypes";

export const incidentReportDefinitions: IncidentReportDefinition[] = [
  {
    id: "IR-01",
    roomId: "lobby",
    label: "Incident Report 01",
    text: "The hallway expressed discomfort with its assigned direction.",
    position: { x: -1.2, y: 1.02, z: -0.4 },
    collectRadius: 2.15
  },
  {
    id: "IR-02",
    roomId: "cubicles",
    label: "Incident Report 02",
    text: "A meeting was scheduled without a time, room, or consenting calendar.",
    position: { x: 9.45, y: 1.0, z: 0.8 },
    collectRadius: 1.75
  },
  {
    id: "IR-03",
    roomId: "elevator",
    label: "Incident Report 03",
    text: "The elevator denied being vertical.",
    position: { x: 13.9, y: 1.0, z: 6.3 },
    collectRadius: 1.75
  }
];
