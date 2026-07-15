export function renderUsernames(container, usernames, { onCopy, onRegenerate }) {
  container.innerHTML = '';

  usernames.forEach((initialUsername) => {
    let username = initialUsername;

    const card = document.createElement('div');
    card.className = 'suggestion-card';

    const nameEl = document.createElement('div');
    nameEl.className = 'suggestion-card__password';
    nameEl.textContent = username;

    const row = document.createElement('div');
    row.className = 'suggestion-card__row suggestion-card__row--end';

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

    copyBtn.addEventListener('click', async () => {
      const succeeded = await onCopy(username);
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
      username = next;
      nameEl.textContent = username;
    });

    actions.append(copyBtn, regenBtn);
    row.append(actions);
    card.append(nameEl, row);
    container.appendChild(card);
  });
}
