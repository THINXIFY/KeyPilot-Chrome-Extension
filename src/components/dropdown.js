let uidCounter = 0;

const CHEVRON_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
const CHECK_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6"/></svg>';

// A premium, accessible replacement for native <select>/<input list> combos.
// The trigger owns focus at all times (search input included); arrow keys move
// a virtual "active" option via aria-activedescendant rather than moving DOM
// focus, matching the ARIA APG "select-only combobox" / "editable combobox
// with list autocomplete" patterns.
export function createDropdown(mountEl, {
  options,
  value = '',
  onChange = () => {},
  searchable = false,
  allowCustom = false,
  onCreateCustom = null,
  labelledBy = '',
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
} = {}) {
  const uid = `dropdown-${++uidCounter}`;
  let currentOptions = options.slice();
  let currentValue = value;
  let isOpen = false;
  let activeIndex = -1;
  let filterQuery = '';
  let closeTimeoutId = null;

  mountEl.classList.add('dropdown');
  mountEl.innerHTML = '';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'dropdown__trigger';
  trigger.id = `${uid}-trigger`;
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (labelledBy) trigger.setAttribute('aria-labelledby', `${labelledBy} ${trigger.id}`);

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'dropdown__trigger-label';
  trigger.appendChild(triggerLabel);

  const chevronWrap = document.createElement('span');
  chevronWrap.className = 'dropdown__chevron';
  chevronWrap.innerHTML = CHEVRON_SVG;
  trigger.appendChild(chevronWrap);

  const panel = document.createElement('div');
  panel.className = 'dropdown__panel';
  panel.hidden = true;

  let searchInput = null;
  if (searchable) {
    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'dropdown__search';
    searchInput.placeholder = searchPlaceholder;
    searchInput.setAttribute('aria-label', searchPlaceholder);
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('spellcheck', 'false');
    panel.appendChild(searchInput);
  }

  const listbox = document.createElement('ul');
  listbox.className = 'dropdown__listbox';
  listbox.setAttribute('role', 'listbox');
  listbox.id = `${uid}-listbox`;
  panel.appendChild(listbox);
  trigger.setAttribute('aria-controls', listbox.id);

  mountEl.append(trigger, panel);

  function findLabel(val) {
    const match = currentOptions.find((o) => o.value === val);
    return match ? match.label : '';
  }

  function updateTriggerLabel() {
    const label = findLabel(currentValue);
    const hasValue = label !== '' || currentValue !== '';
    triggerLabel.textContent = hasValue ? (label || currentValue) : placeholder;
    triggerLabel.classList.toggle('dropdown__trigger-label--placeholder', !hasValue);
  }

  function visibleOptions() {
    if (!searchable || !filterQuery.trim()) return currentOptions;
    const q = filterQuery.trim().toLowerCase();
    return currentOptions.filter((o) => o.label.toLowerCase().includes(q));
  }

  function activeElementForFocus() {
    return searchable && searchInput ? searchInput : trigger;
  }

  function setActiveIndex(index) {
    const rows = Array.from(listbox.querySelectorAll('[role="option"]'));
    if (index < 0 || index >= rows.length) return;
    activeIndex = index;
    rows.forEach((row, i) => row.classList.toggle('dropdown__option--active', i === index));
    const activeRow = rows[index];
    activeRow.scrollIntoView({ block: 'nearest' });
    activeElementForFocus().setAttribute('aria-activedescendant', activeRow.id);
  }

  function selectValue(val, label) {
    currentValue = val;
    if (!currentOptions.some((o) => o.value === val)) {
      currentOptions = [...currentOptions, { value: val, label: label ?? val }];
    }
    updateTriggerLabel();
    closePanel();
    trigger.focus();
    onChange(val);
  }

  function handleCreateCustom(label) {
    if (!onCreateCustom) return;
    const created = onCreateCustom(label);
    if (!created) return;
    if (!currentOptions.some((o) => o.value === created.value)) {
      currentOptions = [...currentOptions, created];
    }
    selectValue(created.value, created.label);
  }

  function renderOptions() {
    listbox.innerHTML = '';
    const opts = visibleOptions();
    const query = filterQuery.trim();
    const exactMatch = query && opts.some((o) => o.label.toLowerCase() === query.toLowerCase());

    if (opts.length === 0 && !(allowCustom && query)) {
      const empty = document.createElement('li');
      empty.className = 'dropdown__empty';
      empty.textContent = 'No matches';
      listbox.appendChild(empty);
    }

    opts.forEach((opt, index) => {
      const row = document.createElement('li');
      row.className = 'dropdown__option';
      row.id = `${uid}-option-${index}`;
      row.setAttribute('role', 'option');
      row.dataset.value = opt.value;
      const selected = opt.value === currentValue;
      row.setAttribute('aria-selected', String(selected));
      row.classList.toggle('dropdown__option--selected', selected);

      const labelEl = document.createElement('span');
      labelEl.className = 'dropdown__option-label';
      labelEl.textContent = opt.label;
      row.appendChild(labelEl);

      if (selected) {
        const check = document.createElement('span');
        check.className = 'dropdown__option-check';
        check.innerHTML = CHECK_SVG;
        row.appendChild(check);
      }

      row.addEventListener('mousedown', (event) => {
        event.preventDefault();
        selectValue(opt.value, opt.label);
      });
      row.addEventListener('mouseenter', () => setActiveIndex(index));

      listbox.appendChild(row);
    });

    if (allowCustom && query && !exactMatch) {
      const createRow = document.createElement('li');
      createRow.className = 'dropdown__option dropdown__option--create';
      createRow.id = `${uid}-option-create`;
      createRow.setAttribute('role', 'option');
      createRow.textContent = `+ Add "${query}"`;
      createRow.addEventListener('mousedown', (event) => {
        event.preventDefault();
        handleCreateCustom(query);
      });
      listbox.appendChild(createRow);
    }

    const initialIndex = opts.findIndex((o) => o.value === currentValue);
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0);
  }

  function openPanel() {
    if (isOpen) return;
    clearTimeout(closeTimeoutId);
    isOpen = true;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    filterQuery = '';
    if (searchInput) searchInput.value = '';
    renderOptions();
    requestAnimationFrame(() => panel.classList.add('dropdown__panel--open'));
    if (searchable && searchInput) searchInput.focus();
    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('keydown', handleKeydown, true);
  }

  function closePanel() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('dropdown__panel--open');
    trigger.setAttribute('aria-expanded', 'false');
    activeElementForFocus().removeAttribute('aria-activedescendant');
    document.removeEventListener('mousedown', handleOutsideClick, true);
    document.removeEventListener('keydown', handleKeydown, true);
    closeTimeoutId = setTimeout(() => {
      if (!isOpen) panel.hidden = true;
    }, 160);
  }

  function togglePanel() {
    if (isOpen) closePanel();
    else openPanel();
  }

  function handleOutsideClick(event) {
    if (!mountEl.contains(event.target)) closePanel();
  }

  function handleKeydown(event) {
    const opts = visibleOptions();

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closePanel();
        trigger.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(Math.min(activeIndex + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(Math.max(activeIndex - 1, 0));
        break;
      case 'Tab':
        closePanel();
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && opts[activeIndex]) {
          selectValue(opts[activeIndex].value, opts[activeIndex].label);
        } else if (allowCustom && filterQuery.trim()) {
          handleCreateCustom(filterQuery.trim());
        }
        break;
      default:
        if (!searchable && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          const letter = event.key.toLowerCase();
          const fromNext = opts.findIndex((o, i) => i > activeIndex && o.label.toLowerCase().startsWith(letter));
          const fromStart = opts.findIndex((o) => o.label.toLowerCase().startsWith(letter));
          const target = fromNext >= 0 ? fromNext : fromStart;
          if (target >= 0) setActiveIndex(target);
        }
        break;
    }
  }

  trigger.addEventListener('click', togglePanel);
  trigger.addEventListener('keydown', (event) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openPanel();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterQuery = searchInput.value;
      renderOptions();
    });
  }

  updateTriggerLabel();

  return {
    getValue: () => currentValue,
    setValue(newValue, { silent = false } = {}) {
      currentValue = newValue;
      updateTriggerLabel();
      if (isOpen) renderOptions();
      if (!silent) onChange(newValue);
    },
    setOptions(newOptions) {
      currentOptions = newOptions.slice();
      updateTriggerLabel();
      if (isOpen) renderOptions();
    },
  };
}
