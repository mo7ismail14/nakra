import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import Button from './Button.jsx';

export default function CopyButton({ text, label = 'نسخ', size = 'sm', variant = 'secondary', iconOnly = false }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('مقدرناش ننسخ، انسخه يدوي');
    }
  };

  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : size}
      icon={copied ? Check : Copy}
      onClick={copy}
      aria-label={iconOnly ? label : undefined}
      title={label}
    >
      {!iconOnly && (copied ? 'اتنسخ' : label)}
    </Button>
  );
}
