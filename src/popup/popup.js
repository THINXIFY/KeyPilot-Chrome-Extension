import { generatePassword, MIN_LENGTH, MAX_LENGTH, DEFAULT_SETTINGS } from '../lib/passwordGenerator.js';
import { calculateStrength } from '../lib/passwordStrength.js';
import { copyToClipboard } from '../lib/clipboard.js';
import {
  generateFromName,
  generateFromWords,
  generateOneFromName,
  generateOneFromWords,
} from '../lib/smartPassword.js';
import { generateMemorable, generateOneMemorable } from '../lib/memorablePassword.js';
import { generatePassphrase, generateOnePassphrase } from '../lib/passphrase.js';
import { generatePronounceable, generateOnePronounceable } from '../lib/pronounceablePassword.js';
import { generateThemed, generateOneThemed } from '../lib/themePassword.js';
import { analyzePassword, generateStrongerPassword } from '../lib/passwordChecker.js';
import { getPresetSettings } from '../lib/presets.js';
import { generateUsernames, generateOneUsername } from '../lib/usernameGenerator.js';
import { generateBulk } from '../lib/bulkGenerator.js';
import {
  loadSettings,
  saveSettings,
  loadSmartMode,
  saveSmartMode,
  loadRememberPreferences,
  setRememberPreferences,
  resetAllSettings,
} from '../lib/settingsStorage.js';
import { showToast } from '../components/toast.js';
import { updateStrengthMeter } from '../components/strengthMeter.js';
import { renderSuggestions } from '../components/smartResults.js';
import { renderUsernames } from '../components/usernameResults.js';
import { renderBulkList } from '../components/bulkResults.js';

const passwordOutput = document.getElementById('password-output');
const passwordCard = document.querySelector('.card');
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
const presetSelect = document.getElementById('preset-select');

const smartModeSelect = document.getElementById('smart-mode-select');
const modePanels = {
  name: document.getElementById('panel-name'),
  words: document.getElementById('panel-words'),
  memorable: document.getElementById('panel-memorable'),
  passphrase: document.getElementById('panel-passphrase'),
  pronounceable: document.getElementById('panel-pronounceable'),
  theme: document.getElementById('panel-theme'),
};
const smartNameInput = document.getElementById('smart-name-input');
const smartWordInputs = [
  document.getElementById('smart-word-1'),
  document.getElementById('smart-word-2'),
  document.getElementById('smart-word-3'),
];
const passphraseWordCountInput = document.getElementById('passphrase-word-count');
const separatorBtns = Array.from(document.querySelectorAll('#panel-passphrase .separator-btn'));
const passphraseNumbersInput = document.getElementById('passphrase-numbers');
const passphraseSymbolsInput = document.getElementById('passphrase-symbols');
const themeBtns = Array.from(document.querySelectorAll('#panel-theme .theme-btn'));
const smartGenerateBtn = document.getElementById('smart-generate-btn');
const smartWarning = document.getElementById('smart-warning');
const smartResultsActions = document.getElementById('smart-results-actions');
const smartCopyAllBtn = document.getElementById('smart-copy-all-btn');
const smartRefreshAllBtn = document.getElementById('smart-refresh-all-btn');
const smartResults = document.getElementById('smart-results');

const toolsModeSelect = document.getElementById('tools-mode-select');
const toolsModePanels = {
  bulk: document.getElementById('panel-bulk'),
  username: document.getElementById('panel-username'),
};
const quantityBtns = Array.from(document.querySelectorAll('#panel-bulk .separator-btn'));
const styleBtns = Array.from(document.querySelectorAll('#panel-username .theme-btn'));
const toolsGenerateBtn = document.getElementById('tools-generate-btn');
const toolsWarning = document.getElementById('tools-warning');
const toolsResultsActions = document.getElementById('tools-results-actions');
const toolsCopyAllBtn = document.getElementById('tools-copy-all-btn');
const toolsRefreshAllBtn = document.getElementById('tools-refresh-all-btn');
const bulkResultsEl = document.getElementById('bulk-results');
const usernameResultsEl = document.getElementById('username-results');

const settingsLengthInput = document.getElementById('settings-length-input');
const settingsModeSelect = document.getElementById('settings-mode-select');
const rememberToggle = document.getElementById('remember-preferences-toggle');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const aboutVersionEl = document.getElementById('about-version');

const checkerInput = document.getElementById('checker-input');
const checkerToggleBtn = document.getElementById('checker-toggle-btn');
const checkerEmpty = document.getElementById('checker-empty');
const checkerResultsEl = document.getElementById('checker-results');
const checkerStrengthSection = document.getElementById('checker-strength');
const checkerScoreValue = document.getElementById('checker-score-value');
const checkerCrackValue = document.getElementById('checker-crack-value');
const checkerWeaknessesList = document.getElementById('checker-weaknesses-list');
const checkerTipsList = document.getElementById('checker-tips-list');
const checkerGenerateBtn = document.getElementById('checker-generate-btn');
const checkerSuggestionResults = document.getElementById('checker-suggestion-results');

const navItems = {
  generator: document.getElementById('nav-generator'),
  smart: document.getElementById('nav-smart'),
  tools: document.getElementById('nav-tools'),
  checker: document.getElementById('nav-checker'),
  settings: document.getElementById('nav-settings'),
};
const screens = {
  generator: document.getElementById('screen-generator'),
  smart: document.getElementById('screen-smart'),
  tools: document.getElementById('screen-tools'),
  checker: document.getElementById('screen-checker'),
  settings: document.getElementById('screen-settings'),
};

let settings = null;
let saveTimeoutId = null;
let activeToolsMode = 'bulk';
let activeQuantity = 10;
let activeUsernameStyle = 'professional';
let activeSmartMode = 'name';
let activeSeparator = '-';
let activeTheme = 'nature';

function switchScreen(name) {
  Object.keys(screens).forEach((key) => {
    const isActive = key === name;
    screens[key].hidden = !isActive;
    navItems[key].classList.toggle('app__nav-item--active', isActive);
    navItems[key].setAttribute('aria-selected', String(isActive));
  });
}

function applySettingsToControls() {
  lengthInput.value = settings.length;
  lengthSlider.value = settings.length;
  settingsLengthInput.value = settings.length;
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
  passwordCard.classList.remove('is-pulsing');
  // Force reflow so the fade-in/pulse animations replay on consecutive changes.
  void passwordOutput.offsetWidth;
  passwordOutput.classList.add('is-updating');
  passwordCard.classList.add('is-pulsing');

  const { label } = calculateStrength(settings);
  updateStrengthMeter(strengthSection, { label, length: settings.length });
}

function persistSettings() {
  clearTimeout(saveTimeoutId);
  saveTimeoutId = setTimeout(() => {
    saveSettings(settings);
  }, 300);
}

function clearActivePreset() {
  presetSelect.value = '';
}

function handleToggleChange() {
  clearActivePreset();
  readTogglesIntoSettings();
  renderPassword();
  persistSettings();
}

function applyLengthValue(newLength) {
  clearActivePreset();
  settings.length = clampLength(newLength);
  lengthInput.value = settings.length;
  lengthSlider.value = settings.length;
  settingsLengthInput.value = settings.length;
  renderPassword();
  persistSettings();
}

function handleLengthInputChange() {
  applyLengthValue(lengthInput.value);
}

function handleLengthSliderInput() {
  applyLengthValue(lengthSlider.value);
}

function handleSettingsLengthChange() {
  applyLengthValue(settingsLengthInput.value);
}

function handlePresetSelect() {
  const presetSettings = getPresetSettings(presetSelect.value);
  if (!presetSettings) return;

  settings = { ...settings, ...presetSettings };
  applySettingsToControls();
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

function readPassphraseOptions() {
  const parsed = Number.parseInt(passphraseWordCountInput.value, 10);
  return {
    wordCount: Number.isNaN(parsed) ? undefined : parsed,
    separator: activeSeparator,
    numbers: passphraseNumbersInput.checked,
    symbols: passphraseSymbolsInput.checked,
  };
}

function generateForActiveMode() {
  switch (activeSmartMode) {
    case 'name': return generateFromName(smartNameInput.value);
    case 'words': return generateFromWords(smartWordInputs.map((input) => input.value));
    case 'memorable': return generateMemorable();
    case 'passphrase': return generatePassphrase(readPassphraseOptions());
    case 'pronounceable': return generatePronounceable();
    case 'theme': return generateThemed(activeTheme);
    default: return null;
  }
}

function regenerateOneForActiveMode() {
  switch (activeSmartMode) {
    case 'name': return generateOneFromName(smartNameInput.value);
    case 'words': return generateOneFromWords(smartWordInputs.map((input) => input.value));
    case 'memorable': return generateOneMemorable();
    case 'passphrase': return generateOnePassphrase(readPassphraseOptions());
    case 'pronounceable': return generateOnePronounceable();
    case 'theme': return generateOneThemed(activeTheme);
    default: return null;
  }
}

function switchSmartMode(mode) {
  activeSmartMode = mode;
  smartModeSelect.value = mode;
  settingsModeSelect.value = mode;
  Object.keys(modePanels).forEach((key) => {
    modePanels[key].hidden = key !== mode;
  });
  smartResults.innerHTML = '';
  smartResultsActions.hidden = true;
  smartWarning.hidden = true;
  updateSmartGenerateState();
  saveSmartMode(mode);
}

function updateSmartGenerateState() {
  const valid = activeSmartMode === 'name'
    ? /[a-zA-Z0-9]/.test(smartNameInput.value)
    : activeSmartMode === 'words'
      ? smartWordInputs.some((input) => input.value.trim().length > 0)
      : true;
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

function handleSmartGenerate() {
  const passwords = generateForActiveMode();

  if (!passwords || passwords.length === 0) {
    smartWarning.hidden = false;
    smartResultsActions.hidden = true;
    smartResults.innerHTML = '';
    return;
  }

  smartWarning.hidden = true;
  smartResultsActions.hidden = false;
  renderSuggestions(smartResults, passwords, {
    onCopy: handleSuggestionCopy,
    onRegenerate: regenerateOneForActiveMode,
  });
}

async function handleCopyAll() {
  const passwords = Array.from(smartResults.querySelectorAll('.suggestion-card__password'))
    .map((el) => el.textContent);
  if (passwords.length === 0) return;

  try {
    const succeeded = await copyToClipboard(passwords.join('\n'));
    showToast(
      app,
      succeeded ? `Copied ${passwords.length} passwords` : 'Copy failed — please try again',
      succeeded ? 'success' : 'error'
    );
  } catch {
    showToast(app, 'Copy failed — please try again', 'error');
  }
}

function renderCheckerList(listEl, items, emptyMessage) {
  listEl.innerHTML = '';

  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'checker-list__item checker-list__item--positive';
    li.textContent = emptyMessage;
    listEl.appendChild(li);
    return;
  }

  items.forEach((text) => {
    const li = document.createElement('li');
    li.className = 'checker-list__item';
    li.textContent = text;
    listEl.appendChild(li);
  });
}

function runCheckerAnalysis() {
  const password = checkerInput.value;

  if (!password) {
    checkerEmpty.hidden = false;
    checkerResultsEl.hidden = true;
    checkerSuggestionResults.innerHTML = '';
    return;
  }

  const analysis = analyzePassword(password);
  checkerEmpty.hidden = true;
  checkerResultsEl.hidden = false;

  updateStrengthMeter(checkerStrengthSection, { label: analysis.label, length: analysis.length });

  checkerScoreValue.textContent = `${analysis.score}/100`;
  checkerScoreValue.className = `checker-stat__value checker-stat__value--${analysis.label.toLowerCase()}`;
  checkerCrackValue.textContent = analysis.crackTime;

  renderCheckerList(checkerWeaknessesList, analysis.weaknesses, 'No significant weaknesses detected — nice work!');
  renderCheckerList(checkerTipsList, analysis.tips, 'This password looks strong. No changes needed.');
}

function handleCheckerToggleVisibility() {
  const isHidden = checkerInput.type === 'password';
  checkerInput.type = isHidden ? 'text' : 'password';
  checkerToggleBtn.textContent = isHidden ? 'Hide' : 'Show';
  checkerToggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

function handleCheckerGenerate() {
  const password = generateStrongerPassword();
  renderSuggestions(checkerSuggestionResults, [password], {
    onCopy: handleSuggestionCopy,
    onRegenerate: generateStrongerPassword,
  });
}

function handleSeparatorChange(btn) {
  activeSeparator = btn.dataset.separator;
  separatorBtns.forEach((b) => b.classList.toggle('separator-btn--active', b === btn));
}

function handleThemeChange(btn) {
  activeTheme = btn.dataset.theme;
  themeBtns.forEach((b) => b.classList.toggle('theme-btn--active', b === btn));
}

function handleQuantitySelect(btn) {
  activeQuantity = Number.parseInt(btn.dataset.quantity, 10);
  quantityBtns.forEach((b) => b.classList.toggle('separator-btn--active', b === btn));
}

function handleStyleSelect(btn) {
  activeUsernameStyle = btn.dataset.usernameStyle;
  styleBtns.forEach((b) => b.classList.toggle('theme-btn--active', b === btn));
}

function switchToolsMode(mode) {
  activeToolsMode = mode;
  toolsModeSelect.value = mode;
  Object.keys(toolsModePanels).forEach((key) => {
    toolsModePanels[key].hidden = key !== mode;
  });
  toolsGenerateBtn.textContent = mode === 'bulk' ? 'Generate Passwords' : 'Generate Usernames';
  bulkResultsEl.hidden = true;
  bulkResultsEl.innerHTML = '';
  usernameResultsEl.hidden = true;
  usernameResultsEl.innerHTML = '';
  toolsResultsActions.hidden = true;
  toolsWarning.hidden = true;
}

async function handleToolsCopy(text) {
  try {
    const succeeded = await copyToClipboard(text);
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

function handleToolsGenerate() {
  if (activeToolsMode === 'bulk') {
    const passwords = generateBulk(settings, activeQuantity);

    if (!passwords) {
      toolsWarning.hidden = false;
      toolsResultsActions.hidden = true;
      bulkResultsEl.hidden = true;
      bulkResultsEl.innerHTML = '';
      return;
    }

    toolsWarning.hidden = true;
    toolsResultsActions.hidden = false;
    usernameResultsEl.hidden = true;
    usernameResultsEl.innerHTML = '';
    bulkResultsEl.hidden = false;
    renderBulkList(bulkResultsEl, passwords, { onCopy: handleToolsCopy });
    return;
  }

  const usernames = generateUsernames(activeUsernameStyle);
  toolsWarning.hidden = true;
  toolsResultsActions.hidden = false;
  bulkResultsEl.hidden = true;
  bulkResultsEl.innerHTML = '';
  usernameResultsEl.hidden = false;
  renderUsernames(usernameResultsEl, usernames, {
    onCopy: handleToolsCopy,
    onRegenerate: () => generateOneUsername(activeUsernameStyle),
  });
}

async function handleToolsCopyAll() {
  const container = activeToolsMode === 'bulk' ? bulkResultsEl : usernameResultsEl;
  const selector = activeToolsMode === 'bulk' ? '.bulk-row__password' : '.suggestion-card__password';
  const items = Array.from(container.querySelectorAll(selector)).map((el) => el.textContent);
  if (items.length === 0) return;

  try {
    const succeeded = await copyToClipboard(items.join('\n'));
    showToast(
      app,
      succeeded ? `Copied ${items.length} ${activeToolsMode === 'bulk' ? 'passwords' : 'usernames'}` : 'Copy failed — please try again',
      succeeded ? 'success' : 'error'
    );
  } catch {
    showToast(app, 'Copy failed — please try again', 'error');
  }
}

async function handleRememberToggle() {
  const remember = rememberToggle.checked;
  await setRememberPreferences(remember);

  if (remember) {
    await saveSettings(settings);
    await saveSmartMode(activeSmartMode);
    showToast(app, 'Preferences will now be remembered', 'success');
  } else {
    showToast(app, 'Preferences will no longer be saved', 'success');
  }
}

async function handleResetSettings() {
  await resetAllSettings();

  settings = { ...DEFAULT_SETTINGS };
  applySettingsToControls();
  renderPassword();
  switchSmartMode('name');
  rememberToggle.checked = true;

  showToast(app, 'All settings reset to defaults', 'success');
}

function loadAboutVersion() {
  try {
    aboutVersionEl.textContent = `v${chrome.runtime.getManifest().version}`;
  } catch {
    aboutVersionEl.textContent = 'v1.3.0';
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
  settingsLengthInput.addEventListener('change', handleSettingsLengthChange);

  toggleInputs.uppercase.addEventListener('change', handleToggleChange);
  toggleInputs.lowercase.addEventListener('change', handleToggleChange);
  toggleInputs.numbers.addEventListener('change', handleToggleChange);
  toggleInputs.symbols.addEventListener('change', handleToggleChange);
  excludeSimilarInput.addEventListener('change', handleToggleChange);
  excludeCharsInput.addEventListener('input', handleToggleChange);
  presetSelect.addEventListener('change', handlePresetSelect);

  const savedSmartMode = await loadSmartMode();
  switchSmartMode(savedSmartMode);

  smartModeSelect.addEventListener('change', () => switchSmartMode(smartModeSelect.value));
  settingsModeSelect.addEventListener('change', () => switchSmartMode(settingsModeSelect.value));
  smartNameInput.addEventListener('input', updateSmartGenerateState);
  smartWordInputs.forEach((input) => input.addEventListener('input', updateSmartGenerateState));
  smartGenerateBtn.addEventListener('click', handleSmartGenerate);
  smartCopyAllBtn.addEventListener('click', handleCopyAll);
  smartRefreshAllBtn.addEventListener('click', handleSmartGenerate);

  separatorBtns.forEach((btn) => btn.addEventListener('click', () => handleSeparatorChange(btn)));
  themeBtns.forEach((btn) => btn.addEventListener('click', () => handleThemeChange(btn)));

  checkerInput.addEventListener('input', runCheckerAnalysis);
  checkerToggleBtn.addEventListener('click', handleCheckerToggleVisibility);
  checkerGenerateBtn.addEventListener('click', handleCheckerGenerate);

  switchToolsMode(activeToolsMode);
  toolsModeSelect.addEventListener('change', () => switchToolsMode(toolsModeSelect.value));
  quantityBtns.forEach((btn) => btn.addEventListener('click', () => handleQuantitySelect(btn)));
  styleBtns.forEach((btn) => btn.addEventListener('click', () => handleStyleSelect(btn)));
  toolsGenerateBtn.addEventListener('click', handleToolsGenerate);
  toolsCopyAllBtn.addEventListener('click', handleToolsCopyAll);
  toolsRefreshAllBtn.addEventListener('click', handleToolsGenerate);

  rememberToggle.checked = await loadRememberPreferences();
  rememberToggle.addEventListener('change', handleRememberToggle);
  resetSettingsBtn.addEventListener('click', handleResetSettings);
  loadAboutVersion();

  Object.keys(navItems).forEach((key) => {
    navItems[key].addEventListener('click', () => switchScreen(key));
  });
}

init();
