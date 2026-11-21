import { ExternalLink, Smartphone, Wallet } from 'lucide-react';
import Button from '../ui/Button.jsx';
import CopyButton from '../ui/CopyButton.jsx';

function Option({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <span className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
        <Icon className="size-5" />
      </span>
      <p className="flex-1 font-medium text-slate-900">{title}</p>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

/** Payment methods on the customer menu. Renders nothing when none is set. */
export default function PaymentOptions({ payments }) {
  const { instapayLink, vodafoneCashNumber, vodafoneCashInstapayLink } = payments || {};
  if (!instapayLink && !vodafoneCashNumber && !vodafoneCashInstapayLink) return null;

  return (
    <section id="payment" className="scroll-mt-20 space-y-3">
      <h2 className="text-lg font-bold text-slate-900">طرق الدفع</h2>
      {instapayLink && (
        <Option icon={Wallet} title="إنستاباي">
          <Button size="sm" icon={ExternalLink} href={instapayLink}>ادفع</Button>
        </Option>
      )}
      {vodafoneCashNumber && (
        <Option icon={Smartphone} title="فودافون كاش">
          <span dir="ltr" className="font-semibold tracking-wide text-slate-700">{vodafoneCashNumber}</span>
          <CopyButton text={vodafoneCashNumber} iconOnly label="نسخ الرقم" />
        </Option>
      )}
      {vodafoneCashInstapayLink && (
        <Option icon={Smartphone} title="فودافون كاش عن طريق إنستاباي">
          <Button size="sm" icon={ExternalLink} href={vodafoneCashInstapayLink}>ادفع</Button>
        </Option>
      )}
    </section>
  );
}
