// Codename Generator
// Generates COLOR-ANIMAL-NUMBER format codenames

const COLORS = [
  'RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE',
  'ORANGE', 'PURPLE', 'GRAY', 'SILVER', 'GOLD', 'BROWN',
  'PINK', 'CYAN', 'MAROON', 'NAVY', 'OLIVE', 'TEAL'
];

const ANIMALS = [
  'WOLF', 'FALCON', 'SHARK', 'TIGER', 'EAGLE', 'BEAR',
  'FOX', 'HAWK', 'LION', 'PANTHER', 'COBRA', 'VIPER',
  'RATTLER', 'STORM', 'THUNDER', 'SHADOW', 'PHANTOM', 'GHOST',
  'RAVEN', 'CROW', 'JAGUAR', 'LYNX', 'OWL', 'SCORPION'
];

/**
 * Generates a codename in format: COLOR-ANIMAL-NUMBER
 * @param {string} deviceId - Device fingerprint hash (for deterministic generation)
 * @returns {string} Codename like "RED-FALCON-7"
 */
export const generateCodename = (deviceId) => {
  // Use deviceId as seed for deterministic generation
  // Same device = same codename
  const seed = deviceId || Math.random().toString();
  
  // Simple deterministic selection based on hash
  const colorIndex = hashToInt(seed + 'color') % COLORS.length;
  const animalIndex = hashToInt(seed + 'animal') % ANIMALS.length;
  const number = (hashToInt(seed + 'number') % 99) + 1; // 1-99
  
  return `${COLORS[colorIndex]}-${ANIMALS[animalIndex]}-${number}`;
};

/**
 * Convert string to integer (simple hash)
 */
const hashToInt = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

/**
 * Get stored codename or generate new one
 */
export const getOrCreateCodename = (deviceId) => {
  let codename = localStorage.getItem('agent_codename');
  if (!codename && deviceId) {
    codename = generateCodename(deviceId);
    localStorage.setItem('agent_codename', codename);
  }
  return codename;
};
