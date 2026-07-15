import { getSuggestionStrength } from '../lib/smartPassword.js';

export function renderSuggestions(container, passwords, { onCopy, onRegenerate }) {
  container.innerHTML = '';

  passwords.forEach((initialPassword) => {
    let password = initialPassword;

    const card = document.createElement('div');
    card.className = 'suggestion-card';

    const pwdEl = document.createElement('span');
    pwdEl.className = 'suggestion-card__password';
    pwdEl.textContent = password;

    const strengthEl = document.createElement('span');
    strengthEl.className = 'suggestion-card__strength';

    const actions = document.createElement('div');
    actions.className = 'suggestion-card__actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'suggestion-card__btn';
    copyBtn.textContent = 'Copy';

    const regenBtn = document.createElement('button');
    regenBtn.type = 'button';
    regenBtn.className = 'suggestion-card__btn suggestion-card__btn--secondary';
    regenBtn.textContent = 'Regenerate';
    regenBtn.setAttribute('aria-label', 'Regenerate this suggestion');

    function applyStrength() {
      const { label } = getSuggestionStrength(password);
      strengthEl.textContent = label;
      strengthEl.className = `suggestion-card__strength suggestion-card__strength--${label.toLowerCase()}`;
    }

    copyBtn.addEventListener('click', async () => {
      const succeeded = await onCopy(password);
      if (succeeded) {
        copyBtn.textContent = 'Copied ✓';
        copyBtn.classList.add('suggestion-card__btn--copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('suggestion-card__btn--copied');
        }, 1500);
      }
    });

    regenBtn.addEventListener('click', () => {
      const next = onRegenerate();
      if (!next) return;
      password = next;
      pwdEl.textContent = password;
      applyStrength();
    });

    applyStrength();
    actions.append(copyBtn, regenBtn);
    card.append(pwdEl, strengthEl, actions);
    container.appendChild(card);
  });
}
