export const PRESETS = {
  banking: {
    label: 'Banking',
    settings: {
      length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: true, excludeChars: '',
    },
  },
  email: {
    label: 'Email',
    settings: {
      length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: false, excludeChars: '',
    },
  },
  social: {
    label: 'Social',
    settings: {
      length: 14, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: false, excludeChars: '',
    },
  },
  work: {
    label: 'Work',
    settings: {
      length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: true, excludeChars: '',
    },
  },
  gaming: {
    label: 'Gaming',
    settings: {
      length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false,
      excludeSimilar: false, excludeChars: '',
    },
  },
  developer: {
    label: 'Developer',
    settings: {
      length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true,
      excludeSimilar: false, excludeChars: '',
    },
  },
};

export function getPresetSettings(key) {
  const preset = PRESETS[key];
  return preset ? { ...preset.settings } : null;
}
