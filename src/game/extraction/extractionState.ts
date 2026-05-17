import type { ExtractionZoneDefinition } from "./extractionTypes";

export const extractionZoneDefinition: ExtractionZoneDefinition = {
  id: "elevator-extraction",
  roomId: "elevator",
  label: "Complete Check-Out",
  position: { x: 16, y: 0.035, z: 9.72 },
  radius: 1.65,
  requiredReportCount: 3
};

export const extractionMessages = {
  locked: "Complete Check-Out unavailable. The elevator is waiting for adequate paperwork.",
  available: "File Audit approved. Please submit findings before the building reconsiders.",
  availableNear: "File Audit approved. Press E to submit findings before the building reconsiders.",
  complete: "Audit filed. The building has marked your concerns as partially received."
} as const;
