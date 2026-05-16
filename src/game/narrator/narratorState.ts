import { narratorMessages } from "./narratorMessages";
import type { NarratorState } from "./narratorTypes";

const initialEventId = "performance-review-pending" as const;
const initialMessage = narratorMessages[initialEventId].messages[0];

export function createInitialNarratorState(): NarratorState {
  return {
    currentMessage: initialMessage,
    currentEventId: initialEventId,
    frame: 0,
    emissionCount: 1,
    globalCooldownFrames: 4,
    lastGlobalFrame: 0,
    lastEventFrames: new Map([[initialEventId, 0]]),
    history: [{ eventId: initialEventId, message: initialMessage, frame: 0 }],
    blockedCount: 0
  };
}

export function resetNarrator(state: NarratorState): void {
  state.currentMessage = initialMessage;
  state.currentEventId = initialEventId;
  state.frame = 0;
  state.emissionCount = 1;
  state.lastGlobalFrame = 0;
  state.lastEventFrames.clear();
  state.lastEventFrames.set(initialEventId, 0);
  state.history = [{ eventId: initialEventId, message: initialMessage, frame: 0 }];
  state.blockedCount = 0;
}
