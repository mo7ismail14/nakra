import { ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button.jsx';

/** Up / down buttons for reordering a list. onMove(-1 | 1) */
export default function MoveButtons({ index, count, onMove, disabled }) {
  return (
    <div className="flex flex-col">
      <Button variant="ghost" size="icon" className="size-6" icon={ChevronUp} disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label="لفوق" title="لفوق" />
      <Button variant="ghost" size="icon" className="size-6" icon={ChevronDown} disabled={disabled || index === count - 1} onClick={() => onMove(1)} aria-label="لتحت" title="لتحت" />
    </div>
  );
}
