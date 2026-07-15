import { getSuggestionStrength } from '../lib/smartPassword.js';

export function renderSuggestions(container, passwords, { onCopy, onRegenerate }) {
  container.innerHTML = '';

  passwords.forEach((initialPassword) => {
    let password = initialPassword;

    const card = document.createElement('div');
    card.className = 'suggestion-card';

    const pwdEl = document.createElement('div');
    pwdEl.className = 'suggestion-card__password';
    pwdEl.textContent = password;

    const row = document.createElement('div');
    row.className = 'suggestion-card__row';

    const meta = document.createElement('div');
    meta.className = 'suggestion-card__meta';

    const strengthEl = document.createElement('span');
    strengthEl.className = 'suggestion-card__strength';

    const lengthEl = document.createElement('span');
    lengthEl.className = 'suggestion-card__length';

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

    function applyMeta() {
      const { label } = getSuggestionStrength(password);
      strengthEl.textContent = label;
      strengthEl.className = `suggestion-card__strength suggestion-card__strength--${label.toLowerCase()}`;
      lengthEl.textContent = `${password.length} chars`;
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
      applyMeta();
    });

    applyMeta();
    meta.append(strengthEl, lengthEl);
    actions.append(copyBtn, regenBtn);
    row.append(meta, actions);
    card.append(pwdEl, row);
    container.appendChild(card);
  });
}
