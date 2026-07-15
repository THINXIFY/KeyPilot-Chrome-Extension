import { generatePassword, MIN_LENGTH, MAX_LENGTH } from '../lib/passwordGenerator.js';
import { calculateStrength } from '../lib/passwordStrength.js';
import { loadSettings, saveSettings } from '../lib/settingsStorage.js';
import { copyToClipboard } from '../lib/clipboard.js';
import {
  generateFromName,
  generateFromWords,
  generateOneFromName,
  generateOneFromWords,
} from '../lib/smartPassword.js';
import { showToast } from '../components/toast.js';
import { updateStrengthMeter } from '../components/strengthMeter.js';
import { renderSuggestions } from '../components/smartResults.js';

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

const tabNameBtn = document.getElementById('tab-name');
const tabWordsBtn = document.getElementById('tab-words');
const panelName = document.getElementById('panel-name');
const panelWords = document.getElementById('panel-words');
const smartNameInput = document.getElementById('smart-name-input');
const smartWordInputs = [
  document.getElementById('smart-word-1'),
  document.getElementById('smart-word-2'),
  document.getElementById('smart-word-3'),
];
const smartGenerateBtn = document.getElementById('smart-generate-btn');
const smartWarning = document.getElementById('smart-warning');
const smartResults = document.getElementById('smart-results');

let settings = null;
let saveTimeoutId = null;
let activeSmartTab = 'name';

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

function switchSmartTab(tab) {
  activeSmartTab = tab;
  const isName = tab === 'name';
  tabNameBtn.classList.toggle('tab--active', isName);
  tabWordsBtn.classList.toggle('tab--active', !isName);
  tabNameBtn.setAttribute('aria-selected', String(isName));
  tabWordsBtn.setAttribute('aria-selected', String(!isName));
  panelName.hidden = !isName;
  panelWords.hidden = isName;
  smartResults.innerHTML = '';
  smartWarning.hidden = true;
  updateSmartGenerateState();
}

function updateSmartGenerateState() {
  const valid = activeSmartTab === 'name'
    ? /[a-zA-Z0-9]/.test(smartNameInput.value)
    : smartWordInputs.some((input) => input.value.trim().length > 0);
  smartGenerateBtn.disabled = !valid;
}

async function handleSuggestionCopy(password) {
  try {
    const succeeded = await copyToClipboard(password);
    showToast(
      app,
      succeeded ? 'Copied to clipboard' : 'Copy failed — please try again',
      succeeded ? 'success' : 'error'
    );
    return succeeded;
  } catch {
    showToast(app, 'Copy failed — please try again', 'error');
    return false;
  }
}

function regenerateActiveSuggestion() {
  return activeSmartTab === 'name'
    ? generateOneFromName(smartNameInput.value)
    : generateOneFromWords(smartWordInputs.map((input) => input.value));
}

function handleSmartGenerate() {
  const passwords = activeSmartTab === 'name'
    ? generateFromName(smartNameInput.value)
    : generateFromWords(smartWordInputs.map((input) => input.value));

  if (!passwords || passwords.length === 0) {
    smartWarning.hidden = false;
    smartResults.innerHTML = '';
    return;
  }

  smartWarning.hidden = true;
  renderSuggestions(smartResults, passwords, {
    onCopy: handleSuggestionCopy,
    onRegenerate: regenerateActiveSuggestion,
  });
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

  tabNameBtn.addEventListener('click', () => switchSmartTab('name'));
  tabWordsBtn.addEventListener('click', () => switchSmartTab('words'));
  smartNameInput.addEventListener('input', updateSmartGenerateState);
  smartWordInputs.forEach((input) => input.addEventListener('input', updateSmartGenerateState));
  smartGenerateBtn.addEventListener('click', handleSmartGenerate);
  updateSmartGenerateState();
}

init();
