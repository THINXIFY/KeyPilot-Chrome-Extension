const FILL_PERCENT_BY_VARIANT = {
  weak: 25,
  fair: 50,
  strong: 75,
  excellent: 100,
};

const LABEL_TO_VARIANT = {
  Weak: 'weak',
  Fair: 'fair',
  Strong: 'strong',
  Excellent: 'excellent',
};

export function updateStrengthMeter(container, { label, length }) {
  const fill = container.querySelector('.strength-meter__fill');
  const text = container.querySelector('.strength-meter__label');
  const count = container.querySelector('.strength-meter__count');
  if (!fill || !text || !count) return;

  const variant = LABEL_TO_VARIANT[label] || 'weak';

  fill.style.width = `${FILL_PERCENT_BY_VARIANT[variant]}%`;
  fill.className = `strength-meter__fill strength-meter__fill--${variant}`;
  text.textContent = `Strength: ${label}`;
  count.textContent = `${length} characters`;
}
