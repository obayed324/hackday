// Signal Code Library
// Predefined dictionary of visual signals
// Each signal = Color + Shape + Motion + Duration

export const SIGNAL_CODES = [
  {
    codeId: 'CMD_START',
    color: 'red',
    shape: 'triangle',
    motion: 'pulse',
    durationMs: 2000,
    meaning: 'Start mission',
    urgency: 'high'
  },
  {
    codeId: 'CMD_HOLD',
    color: 'blue',
    shape: 'square',
    motion: 'pulse',
    durationMs: 2000,
    meaning: 'Hold position',
    urgency: 'medium'
  },
  {
    codeId: 'CMD_ABORT',
    color: 'red',
    shape: 'circle',
    motion: 'flash',
    durationMs: 1000,
    meaning: 'Abort mission',
    urgency: 'critical'
  },
  {
    codeId: 'CMD_PROCEED',
    color: 'green',
    shape: 'triangle',
    motion: 'steady',
    durationMs: 3000,
    meaning: 'Proceed as planned',
    urgency: 'low'
  },
  {
    codeId: 'CMD_WAIT',
    color: 'yellow',
    shape: 'square',
    motion: 'pulse',
    durationMs: 1500,
    meaning: 'Wait for further instructions',
    urgency: 'medium'
  },
  {
    codeId: 'CMD_RETREAT',
    color: 'orange',
    shape: 'triangle',
    motion: 'flash',
    durationMs: 2000,
    meaning: 'Retreat immediately',
    urgency: 'high'
  },
  {
    codeId: 'CMD_SECURE',
    color: 'green',
    shape: 'square',
    motion: 'steady',
    durationMs: 2500,
    meaning: 'Area secure',
    urgency: 'low'
  },
  {
    codeId: 'CMD_DANGER',
    color: 'red',
    shape: 'diamond',
    motion: 'flash',
    durationMs: 1000,
    meaning: 'Danger detected',
    urgency: 'critical'
  },
  {
    codeId: 'CMD_ALL_CLEAR',
    color: 'green',
    shape: 'circle',
    motion: 'pulse',
    durationMs: 2000,
    meaning: 'All clear',
    urgency: 'low'
  },
  {
    codeId: 'CMD_STANDBY',
    color: 'blue',
    shape: 'square',
    motion: 'steady',
    durationMs: 3000,
    meaning: 'Standby for orders',
    urgency: 'low'
  }
];

// Available options for signal composition
export const SIGNAL_OPTIONS = {
  colors: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'black', 'white'],
  shapes: ['circle', 'square', 'triangle', 'diamond', 'star'],
  motions: ['steady', 'pulse', 'flash', 'rotate', 'bounce'],
  durations: [1000, 1500, 2000, 2500, 3000] // milliseconds
};

/**
 * Find signal code by properties
 */
export const findSignalCode = (color, shape, motion, durationMs) => {
  return SIGNAL_CODES.find(
    code =>
      code.color === color &&
      code.shape === shape &&
      code.motion === motion &&
      code.durationMs === durationMs
  );
};

/**
 * Get signal code by ID
 */
export const getSignalCode = (codeId) => {
  return SIGNAL_CODES.find(code => code.codeId === codeId);
};
