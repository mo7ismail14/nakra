import Button from './Button.jsx';
import Modal from './Modal.jsx';
import Alert from './Alert.jsx';
import LinkBox from './LinkBox.jsx';

/**
 * After sending an invitation / setup link: says whether the email went out,
 * and always shows the link so it can be shared another way (WhatsApp...).
 */
export default function SharedLinkResult({ email, emailSent, link }) {
  return (
    <div className="space-y-3">
      {emailSent ? (
        <Alert variant="success">
          اتبعت إيميل لـ <span dir="ltr" className="break-all">{email}</span>. ممكن كمان تبعت اللينك ده بنفسك:
        </Alert>
      ) : (
        <Alert variant="warning">
          الإيميل ما اتبعتش (اتأكد من إعدادات SMTP). ابعت اللينك ده لـ <span dir="ltr" className="break-all">{email}</span> بنفسك:
        </Alert>
      )}
      <LinkBox url={link} />
    </div>
  );
}

/** The same result inside a dialog (after creating an admin / resending a setup link). */
export function SharedLinkModal({ title, result, onClose }) {
  return (
    <Modal open onClose={onClose} title={title} footer={<Button onClick={onClose}>تمام</Button>}>
      <SharedLinkResult {...result} />
    </Modal>
  );
}
