import { narratorMessages } from "./narratorMessages";
import type { NarratorEmitOptions, NarratorEventId, NarratorState } from "./narratorTypes";

const maxHistoryLength = 16;

export function tickNarrator(state: NarratorState): void {
  state.frame += 1;
}

export function emitNarrator(
  state: NarratorState,
  eventId: NarratorEventId,
  options: NarratorEmitOptions = {}
): string | null {
  const definition = narratorMessages[eventId];
  const lastEventFrame = state.lastEventFrames.get(eventId);
  const eventCoolingDown = lastEventFrame !== undefined && state.frame - lastEventFrame < definition.cooldownFrames;
  const globalCoolingDown = state.frame - state.lastGlobalFrame < state.globalCooldownFrames;

  if (!options.force && (eventCoolingDown || globalCoolingDown)) {
    state.blockedCount += 1;
    return null;
  }

  const messageIndex = state.emissionCount % definition.messages.length;
  const message = definition.messages[messageIndex];

  state.currentMessage = message;
  state.currentEventId = eventId;
  state.emissionCount += 1;
  state.lastGlobalFrame = state.frame;
  state.lastEventFrames.set(eventId, state.frame);
  state.history.push({ eventId, message, frame: state.frame });

  if (state.history.length > maxHistoryLength) {
    state.history.shift();
  }

  return message;
}
