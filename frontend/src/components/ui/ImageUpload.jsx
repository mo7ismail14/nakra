import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { cn } from '../../utils/helpers.js';
import { Field } from './Input.jsx';

const MAX_MB = 3;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Pick / preview / remove one image.
 * @param {string|null} currentUrl  image already saved on the server
 * @param {(file: File|null, removed: boolean) => void} onChange
 *        file = new image, or null + removed=true when the saved one should be deleted
 */
export default function ImageUpload({ label, currentUrl, onChange, error, shape = 'square', hint, className }) {
  const id = useId();
  const toast = useToast();
  const input = useRef(null);
  const [preview, setPreview] = useState(currentUrl || null);

  useEffect(() => () => preview?.startsWith('blob:') && URL.revokeObjectURL(preview), [preview]);

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return toast.error('الصور المسموحة: JPG أو PNG أو WEBP');
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`الصورة أكبر من ${MAX_MB} ميجا`);
    setPreview(URL.createObjectURL(file));
    onChange(file, false);
  };

  const remove = () => {
    setPreview(null);
    onChange(null, Boolean(currentUrl));
  };

  return (
    <Field id={id} label={label} error={error} hint={hint ?? `JPG أو PNG أو WEBP، أقصى حجم ${MAX_MB} ميجا`} className={className}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn(
            'group relative flex size-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed bg-slate-50 transition hover:border-brand-500',
            shape === 'circle' ? 'rounded-full' : 'rounded-xl',
            error ? 'border-red-400' : 'border-slate-300',
          )}
          aria-label="اختيار صورة"
        >
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-7 text-slate-400 group-hover:text-brand-600" />
          )}
        </button>
        <div className="flex flex-col items-start gap-1">
          <button type="button" onClick={() => input.current?.click()} className="text-sm font-medium text-brand-700 hover:underline">
            {preview ? 'تغيير الصورة' : 'رفع صورة'}
          </button>
          {preview && (
            <button type="button" onClick={remove} className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
              <Trash2 className="size-3.5" />
              إزالة
            </button>
          )}
        </div>
        <input ref={input} id={id} type="file" accept={TYPES.join(',')} onChange={pick} className="hidden" />
      </div>
    </Field>
  );
}
