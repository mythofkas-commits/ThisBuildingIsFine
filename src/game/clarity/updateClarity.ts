import { clarityEvents, roomClarityEvents } from "./clarityState";
import type { ClarityChange, ClarityEventId, ClarityState } from "./clarityTypes";

export function applyClarityEvent(state: ClarityState, eventId: ClarityEventId): ClarityChange {
  const event = clarityEvents[eventId];
  const previous = state.value;

  if (event.once && state.appliedEventIds.has(eventId)) {
    return {
      changed: false,
      eventId,
      previous,
      current: previous,
      delta: 0,
      message: state.lastMessage
    };
  }

  const current = clamp(previous + event.delta, state.min, state.max);
  state.value = current;
  state.lastEventId = eventId;
  state.lastMessage = event.message;
  state.appliedEventIds.add(eventId);

  return {
    changed: current !== previous,
    eventId,
    previous,
    current,
    delta: current - previous,
    message: event.message
  };
}

export function applyRoomClarityEvent(state: ClarityState, roomId: string | null): ClarityChange | null {
  if (!roomId) {
    return null;
  }

  const eventId = roomClarityEvents[roomId];
  return eventId ? applyClarityEvent(state, eventId) : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
