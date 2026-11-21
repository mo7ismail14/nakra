/** Returns a copy of arr with the element at index moved by step (-1 up, +1 down). */
export function moveItem(arr, index, step) {
  const target = index + step;
  if (target < 0 || target >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** Plain object (+ optional files) -> FormData. Skips undefined; booleans become "true"/"false". */
export function toFormData(values, files = {}) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    fd.append(key, typeof value === 'boolean' ? String(value) : value);
  }
  for (const [key, file] of Object.entries(files)) if (file) fd.append(key, file);
  return fd;
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const cn = (...classes) => classes.filter(Boolean).join(' ');
