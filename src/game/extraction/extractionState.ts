import type { ExtractionZoneDefinition } from "./extractionTypes";

export const extractionZoneDefinition: ExtractionZoneDefinition = {
  id: "elevator-extraction",
  roomId: "elevator",
  label: "Extraction Elevator",
  position: { x: 16, y: 0.035, z: 9.72 },
  radius: 1.65,
  requiredReportCount: 3
};

export const extractionMessages = {
  locked: "Extraction unavailable. The elevator is waiting for adequate paperwork.",
  available: "Extraction approved. Please leave before the building reconsiders.",
  availableNear: "Extraction approved. Press E to file the audit before the building reconsiders.",
  complete: "Audit filed. The building has marked your concerns as partially received."
} as const;
