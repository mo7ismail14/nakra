import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

/**
 * For buttons that call the API (delete, resend, toggle...): tracks loading and shows
 * a toast on success / error, so pages don't repeat try/catch.
 *
 *   const remove = useAction((id) => api.remove(id), { successMessage: 'اتمسح' });
 *   <Button loading={remove.running} onClick={() => remove.run(id)} />
 */
export function useAction(action, { successMessage, onSuccess } = {}) {
  const toast = useToast();
  const [running, setRunning] = useState(false);

  const run = async (...args) => {
    setRunning(true);
    try {
      const result = await action(...args);
      if (successMessage) toast.success(successMessage);
      await onSuccess?.(result, ...args);
      return { ok: true, result };
    } catch (err) {
      toast.error(err.message || 'حصل خطأ غير متوقع');
      return { ok: false, error: err };
    } finally {
      setRunning(false);
    }
  };

  return { run, running };
}
