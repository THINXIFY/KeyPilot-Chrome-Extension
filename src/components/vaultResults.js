function maskPassword(password) {
  return '•'.repeat(Math.min(password.length, 16) || 8);
}

function appendMiniButton(row, { text, label, onClick }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'vault-card__mini-btn';
  btn.textContent = text;
  if (label) btn.setAttribute('aria-label', label);
  btn.addEventListener('click', onClick);
  row.appendChild(btn);
  return btn;
}

export function renderVaultList(container, accounts, options) {
  const {
    emptyMessage, onCopy, onEdit, onDelete, onOpenUrl,
  } = options;

  container.innerHTML = '';

  if (accounts.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'mode-panel__hint';
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }

  accounts.forEach((entry) => {
    const card = document.createElement('div');
    card.className = 'vault-card';

    const header = document.createElement('div');
    header.className = 'vault-card__header';

    const labelEl = document.createElement('span');
    labelEl.className = 'vault-card__label';
    labelEl.textContent = entry.label;
    header.appendChild(labelEl);

    if (entry.category) {
      const tag = document.createElement('span');
      tag.className = 'vault-card__tag';
      tag.textContent = entry.category;
      header.appendChild(tag);
    }

    card.appendChild(header);

    if (entry.username) {
      const row = document.createElement('div');
      row.className = 'vault-card__row';
      const value = document.createElement('span');
      value.className = 'vault-card__value';
      value.textContent = entry.username;
      row.appendChild(value);
      appendMiniButton(row, {
        text: 'Copy',
        label: 'Copy username',
        onClick: () => onCopy(entry.username, 'Username'),
      });
      card.appendChild(row);
    }

    const passwordRow = document.createElement('div');
    passwordRow.className = 'vault-card__row';
    const passwordValue = document.createElement('span');
    passwordValue.className = 'vault-card__value vault-card__value--password';
    passwordValue.textContent = maskPassword(entry.password);
    passwordRow.appendChild(passwordValue);

    let revealed = false;
    const toggleBtn = appendMiniButton(passwordRow, {
      text: 'Show',
      label: 'Show password',
      onClick: () => {
        revealed = !revealed;
        passwordValue.textContent = revealed ? entry.password : maskPassword(entry.password);
        toggleBtn.textContent = revealed ? 'Hide' : 'Show';
        toggleBtn.setAttribute('aria-label', revealed ? 'Hide password' : 'Show password');
      },
    });
    appendMiniButton(passwordRow, {
      text: 'Copy',
      label: 'Copy password',
      onClick: () => onCopy(entry.password, 'Password'),
    });
    card.appendChild(passwordRow);

    if (entry.url) {
      const urlRow = document.createElement('div');
      urlRow.className = 'vault-card__row';
      const urlBtn = document.createElement('button');
      urlBtn.type = 'button';
      urlBtn.className = 'vault-card__link';
      urlBtn.textContent = entry.url;
      urlBtn.setAttribute('aria-label', `Open ${entry.url} in a new tab`);
      urlBtn.addEventListener('click', () => onOpenUrl(entry.url));
      urlRow.appendChild(urlBtn);
      card.appendChild(urlRow);
    }

    if (entry.notes) {
      const notesEl = document.createElement('p');
      notesEl.className = 'vault-card__notes';
      notesEl.textContent = entry.notes;
      card.appendChild(notesEl);
    }

    const actions = document.createElement('div');
    actions.className = 'suggestion-card__actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'suggestion-card__btn suggestion-card__btn--secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => onEdit(entry));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'suggestion-card__btn suggestion-card__btn--secondary';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => onDelete(entry.id));

    actions.append(editBtn, deleteBtn);
    card.appendChild(actions);

    container.appendChild(card);
  });
}
