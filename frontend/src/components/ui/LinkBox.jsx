import { ExternalLink } from 'lucide-react';
import Button from './Button.jsx';
import CopyButton from './CopyButton.jsx';

/** A read-only link with copy (and optional open) buttons. */
export default function LinkBox({ url, openable = false }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 ps-3">
      <span dir="ltr" className="min-w-0 flex-1 truncate text-start text-sm text-slate-700" title={url}>
        {url}
      </span>
      {openable && <Button variant="ghost" size="icon" icon={ExternalLink} href={url} aria-label="فتح" title="فتح" />}
      <CopyButton text={url} />
    </div>
  );
}
