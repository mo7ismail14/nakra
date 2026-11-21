import { Download } from 'lucide-react';
import { downloadDataUrl } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';
import CopyButton from '../ui/CopyButton.jsx';

/** One QR code: image + what it contains + download / copy. Shows `emptyAction` when missing. */
export default function QrCard({ title, description, qr, fileName, emptyText, emptyAction }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 min-h-10 text-sm text-slate-500">{description}</p>
      {qr ? (
        <>
          <img src={qr.dataUrl} alt={`QR ${title}`} className="mx-auto my-4 aspect-square w-full max-w-48 rounded-lg border border-slate-100" />
          <p dir="ltr" className="mb-4 truncate rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-600" title={qr.value}>
            {qr.value}
          </p>
          <div className="mt-auto flex gap-2">
            <Button icon={Download} size="sm" className="flex-1 justify-center" onClick={() => downloadDataUrl(qr.dataUrl, `${fileName}.png`)}>
              تحميل
            </Button>
            <CopyButton text={qr.value} />
          </div>
        </>
      ) : (
        <div className="my-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          {emptyText}
          {emptyAction}
        </div>
      )}
    </div>
  );
}
