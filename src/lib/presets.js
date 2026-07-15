export const PRESETS = {
  banking: {
    label: 'Banking',
    settings: {
      length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: true, excludeChars: '', avoidRepeated: true, avoidSequential: true,
    },
  },
  email: {
    label: 'Email',
    settings: {
      length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: false, excludeChars: '', avoidRepeated: false, avoidSequential: true,
    },
  },
  social: {
    label: 'Social',
    settings: {
      length: 14, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: false, excludeChars: '', avoidRepeated: false, avoidSequential: false,
    },
  },
  work: {
    label: 'Work',
    settings: {
      length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: true, excludeChars: '', avoidRepeated: true, avoidSequential: true,
    },
  },
  gaming: {
    label: 'Gaming',
    settings: {
      length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false,
      excludeSimilar: false, excludeChars: '', avoidRepeated: false, avoidSequential: false,
    },
  },
  developer: {
    label: 'Developer',
    settings: {
      length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: false, excludeChars: '', avoidRepeated: true, avoidSequential: true,
    },
  },
};

export function getPresetSettings(key) {
  const preset = PRESETS[key];
  return preset ? { ...preset.settings } : null;
}
