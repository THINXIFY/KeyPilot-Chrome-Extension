import { generatePassword, MIN_LENGTH, MAX_LENGTH } from '../lib/passwordGenerator.js';
import { calculateStrength } from '../lib/passwordStrength.js';
import { loadSettings, saveSettings } from '../lib/settingsStorage.js';
import { copyToClipboard } from '../lib/clipboard.js';
import { showToast } from '../components/toast.js';
import { updateStrengthMeter } from '../components/strengthMeter.js';

const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const app = document.querySelector('.app');
const strengthSection = document.querySelector('.strength');
const lengthInput = document.getElementById('length-input');
const lengthSlider = document.getElementById('length-slider');
const warningBanner = document.getElementById('warning-banner');

const toggleInputs = {
  uppercase: document.getElementById('toggle-uppercase'),
  lowercase: document.getElementById('toggle-lowercase'),
  numbers: document.getElementById('toggle-numbers'),
  symbols: document.getElementById('toggle-symbols'),
};
const excludeSimilarInput = document.getElementById('toggle-exclude-similar');
const excludeCharsInput = document.getElementById('exclude-chars-input');

let settings = null;
let saveTimeoutId = null;

function applySettingsToControls() {
  lengthInput.value = settings.length;
  lengthSlider.value = settings.length;
  toggleInputs.uppercase.checked = settings.uppercase;
  toggleInputs.lowercase.checked = settings.lowercase;
  toggleInputs.numbers.checked = settings.numbers;
  toggleInputs.symbols.checked = settings.symbols;
  excludeSimilarInput.checked = settings.excludeSimilar;
  excludeCharsInput.value = settings.excludeChars;
}

function readTogglesIntoSettings() {
  settings = {
    ...settings,
    uppercase: toggleInputs.uppercase.checked,
    lowercase: toggleInputs.lowercase.checked,
    numbers: toggleInputs.numbers.checked,
    symbols: toggleInputs.symbols.checked,
    excludeSimilar: excludeSimilarInput.checked,
    excludeChars: excludeCharsInput.value,
  };
}

function clampLength(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return settings.length;
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, parsed));
}

function renderPassword() {
  const password = generatePassword(settings);

  if (password === null) {
    passwordOutput.value = '';
    warningBanner.hidden = false;
    generateBtn.disabled = true;
    copyBtn.disabled = true;
    updateStrengthMeter(strengthSection, { label: 'Weak', length: settings.length });
    return;
  }

  warningBanner.hidden = true;
  generateBtn.disabled = false;
  copyBtn.disabled = false;

  passwordOutput.value = password;
  passwordOutput.classList.remove('is-updating');
  // Force reflow so the fade-in animation replays on consecutive changes.
  void passwordOutput.offsetWidth;
  passwordOutput.classList.add('is-updating');

  const { label } = calculateStrength(settings);
  updateStrengthMeter(strengthSection, { label, length: settings.length });
}

function persistSettings() {
  clearTimeout(saveTimeoutId);
  saveTimeoutId = setTimeout(() => {
    saveSettings(settings);
  }, 300);
}

function handleToggleChange() {
  readTogglesIntoSettings();
  renderPassword();
  persistSettings();
}

function handleLengthInputChange() {
  settings.length = clampLength(lengthInput.value);
  lengthInput.value = settings.length;
  lengthSlider.value = settings.length;
  renderPassword();
  persistSettings();
}

function handleLengthSliderInput() {
  settings.length = Number.parseInt(lengthSlider.value, 10);
  lengthInput.value = settings.length;
  renderPassword();
  persistSettings();
}

const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied ✓';
let copiedTimeoutId = null;

async function handleCopy() {
  if (!passwordOutput.value) return;

  try {
    const succeeded = await copyToClipboard(passwordOutput.value);
    showToast(
      app,
      succeeded ? 'Copied to clipboard' : 'Copy failed — please try again',
      succeeded ? 'success' : 'error'
    );

    if (succeeded) {
      clearTimeout(copiedTimeoutId);
      copyBtn.textContent = COPIED_LABEL;
      copyBtn.classList.add('btn--copied');
      copiedTimeoutId = setTimeout(() => {
        copyBtn.textContent = COPY_LABEL;
        copyBtn.classList.remove('btn--copied');
      }, 1500);
    }
  } catch {
    showToast(app, 'Copy failed — please try again', 'error');
  }
}

async function init() {
  settings = await loadSettings();
  applySettingsToControls();
  renderPassword();

  generateBtn.addEventListener('click', renderPassword);
  copyBtn.addEventListener('click', handleCopy);

  lengthInput.addEventListener('change', handleLengthInputChange);
  lengthSlider.addEventListener('input', handleLengthSliderInput);

  toggleInputs.uppercase.addEventListener('change', handleToggleChange);
  toggleInputs.lowercase.addEventListener('change', handleToggleChange);
  toggleInputs.numbers.addEventListener('change', handleToggleChange);
  toggleInputs.symbols.addEventListener('change', handleToggleChange);
  excludeSimilarInput.addEventListener('change', handleToggleChange);
  excludeCharsInput.addEventListener('input', handleToggleChange);
}

init();
