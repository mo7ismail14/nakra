import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';

const ConfirmContext = createContext(null);

/**
 * One confirm dialog for the whole app:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'مسح المطعم؟', message: '...', confirmText: 'مسح' })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions({ confirmText: 'تأكيد', danger: true, ...opts });
      }),
    [],
  );

  const close = (answer) => {
    resolver.current?.(answer);
    resolver.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(options)}
        onClose={() => close(false)}
        title={options?.title}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              إلغاء
            </Button>
            <Button variant={options?.danger ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
              {options?.confirmText}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-7 text-slate-600">{options?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
