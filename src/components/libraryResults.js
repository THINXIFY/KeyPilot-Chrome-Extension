function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function renderLibraryList(container, entries, options) {
  const { emptyMessage, isFavoriteMode, onCopy, onGenerateSimilar, onToggleFavorite, onRemove } = options;

  container.innerHTML = '';

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'mode-panel__hint';
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    let password = entry.password;

    const card = document.createElement('div');
    card.className = 'suggestion-card';

    const textEl = document.createElement('div');
    textEl.className = 'suggestion-card__password';
    textEl.textContent = password;

    const row = document.createElement('div');
    row.className = 'suggestion-card__row';

    const timeEl = document.createElement('span');
    timeEl.className = 'suggestion-card__length';
    timeEl.textContent = formatRelativeTime(entry.savedAt || entry.copiedAt);

    const actions = document.createElement('div');
    actions.className = 'suggestion-card__actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'suggestion-card__btn';
    copyBtn.textContent = 'Copy';
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

    const similarBtn = document.createElement('button');
    similarBtn.type = 'button';
    similarBtn.className = 'suggestion-card__btn suggestion-card__btn--secondary';
    similarBtn.textContent = 'Similar';
    similarBtn.setAttribute('aria-label', 'Generate a similar password');
    similarBtn.addEventListener('click', () => {
      const next = onGenerateSimilar(password);
      if (!next) return;
      password = next;
      textEl.textContent = password;
    });

    actions.append(copyBtn, similarBtn);

    if (isFavoriteMode) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'suggestion-card__btn suggestion-card__btn--secondary';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => onRemove(entry.password));
      actions.append(removeBtn);
    } else {
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'suggestion-card__btn';
      favBtn.textContent = '☆ Save';
      favBtn.setAttribute('aria-label', 'Add to favorites');
      favBtn.addEventListener('click', async () => {
        await onToggleFavorite(password);
        favBtn.textContent = 'Saved ✓';
        favBtn.classList.add('suggestion-card__btn--copied');
        setTimeout(() => {
          favBtn.textContent = '☆ Save';
          favBtn.classList.remove('suggestion-card__btn--copied');
        }, 1500);
      });
      actions.append(favBtn);
    }

    row.append(timeEl, actions);
    card.append(textEl, row);
    container.appendChild(card);
  });
}
