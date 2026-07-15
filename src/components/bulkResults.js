export function renderBulkList(container, passwords, { onCopy }) {
  container.innerHTML = '';

  passwords.forEach((password) => {
    const row = document.createElement('div');
    row.className = 'bulk-row';

    const textEl = document.createElement('span');
    textEl.className = 'bulk-row__password';
    textEl.textContent = password;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'bulk-row__copy';
    copyBtn.textContent = 'Copy';

    copyBtn.addEventListener('click', async () => {
      const succeeded = await onCopy(password);
      if (succeeded) {
        copyBtn.textContent = '✓';
        copyBtn.classList.add('bulk-row__copy--copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('bulk-row__copy--copied');
        }, 1200);
      }
    });

    row.append(textEl, copyBtn);
    container.appendChild(row);
  });
}
