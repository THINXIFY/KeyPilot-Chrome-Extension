let hideTimeoutId = null;

export function showToast(container, message, variant = 'success') {
  const toast = container.querySelector('.toast');
  if (!toast) return;

  clearTimeout(hideTimeoutId);

  toast.textContent = message;
  toast.classList.remove('toast--success', 'toast--error');
  toast.classList.add(variant === 'error' ? 'toast--error' : 'toast--success');
  toast.classList.add('toast--visible');

  hideTimeoutId = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 2000);
}
