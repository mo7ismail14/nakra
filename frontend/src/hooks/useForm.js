import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';

/**
 * The single form hook used by every form in the app.
 *
 *   const form = useForm({
 *     initial: { email: '' },
 *     validate: (v) => (v.email ? {} : { email: 'مطلوب' }),   // optional, client-side
 *     onSubmit: (values) => api.call(values),                 // may throw ApiError
 *     onSuccess: (result) => navigate('/'),                   // optional
 *     successMessage: 'تم الحفظ',                              // optional toast
 *   });
 *   <form onSubmit={form.handleSubmit}>
 *     <Input label="الإيميل" {...form.field('email')} />
 *     <FormError form={form} />
 *     <Button type="submit" loading={form.submitting}>حفظ</Button>
 *   </form>
 */
export function useForm({ initial, validate, onSubmit, onSuccess, successMessage }) {
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  /** Props for <Input>, <Switch>, ... : value, onChange, error */
  const field = (name) => ({
    name,
    value: values[name] ?? '',
    error: errors[name],
    onChange: (eventOrValue) => {
      const target = eventOrValue?.target;
      const value = target ? (target.type === 'checkbox' ? target.checked : target.value) : eventOrValue;
      setValue(name, value);
    },
  });

  // After errors render, move the user to the first invalid field.
  const focusFirstError = () =>
    requestAnimationFrame(() => {
      const el = document.querySelector('[aria-invalid="true"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
    });

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (submitting) return;
    setFormError('');

    const clientErrors = validate?.(values) || {};
    if (Object.values(clientErrors).some(Boolean)) {
      setErrors(clientErrors);
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit(values);
      setErrors({});
      if (successMessage) toast.success(successMessage);
      await onSuccess?.(result, values);
    } catch (err) {
      const fieldErrors = err.fieldErrors || {};
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length) focusFirstError();
      // Show the general message only when it isn't already shown under a field.
      const hasFieldErrors = Object.keys(fieldErrors).length > 0;
      setFormError(hasFieldErrors ? 'راجع البيانات المكتوبة' : err.message || 'حصل خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValue, setValues, errors, formError, submitting, field, handleSubmit };
}
