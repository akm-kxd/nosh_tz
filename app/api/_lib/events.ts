import { EventEmitter } from "events";

type EventPayload = {
  type: string;
  data?: unknown;
};

const globalForEvents = globalThis as unknown as {
  eventBus?: EventEmitter;
};

export const eventBus: EventEmitter = globalForEvents.eventBus ?? new EventEmitter();
if (!globalForEvents.eventBus) {
  globalForEvents.eventBus = eventBus;
}

export function emitEvent(type: string, data?: unknown) {
  const payload: EventPayload = { type, data };
  eventBus.emit("message", payload);
}


