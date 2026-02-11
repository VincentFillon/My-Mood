// SSE Events (server → client broadcast)
export const SSE_EVENTS = {
  MOOD_CHANGED: 'mood.changed',
  MOOD_REACTION: 'mood.reaction',
  MEMBER_JOINED: 'member.joined',
  MEMBER_LEFT: 'member.left',
  CHALLENGE_UPDATED: 'challenge.updated',
} as const;

// WebSocket Events: client → server
export const WS_CLIENT_EVENTS = {
  MESSAGE_SEND: 'message.send',
  REACTION_ADD: 'reaction.add',
  TYPING_START: 'typing.start',
  TYPING_STOP: 'typing.stop',
} as const;

// WebSocket Events: server → client
export const WS_SERVER_EVENTS = {
  MESSAGE_RECEIVED: 'message.received',
  REACTION_ADDED: 'reaction.added',
  TYPING_UPDATE: 'typing.update',
} as const;
