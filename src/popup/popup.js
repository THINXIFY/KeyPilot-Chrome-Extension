import { generatePassword } from '../lib/passwordGenerator.js';
import { copyToClipboard } from '../lib/clipboard.js';
import { showToast } from '../components/toast.js';

const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const app = document.querySelector('.app');

function renderPassword() {
  passwordOutput.value = generatePassword();
  passwordOutput.classList.remove('is-updating');
  // Force reflow so the fade-in animation replays on consecutive clicks.
  void passwordOutput.offsetWidth;
  passwordOutput.classList.add('is-updating');
}

async function handleCopy() {
  if (!passwordOutput.value) return;

  const succeeded = await copyToClipboard(passwordOutput.value);
  showToast(
    app,
    succeeded ? 'Copied to clipboard' : 'Copy failed — please try again',
    succeeded ? 'success' : 'error'
  );
}

generateBtn.addEventListener('click', renderPassword);
copyBtn.addEventListener('click', handleCopy);

renderPassword();
