import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/helpers.js';
import Button from './Button.jsx';

/** Up / down buttons for reordering a list. onMove(-1 | 1). Side by side, big enough for a finger. */
export default function MoveButtons({ index, count, onMove, disabled, className }) {
  const size = 'size-8';
  return (
    <div className={cn('flex items-center', className)}>
      <Button variant="ghost" size="icon" className={size} icon={ChevronUp} disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label="لفوق" title="لفوق" />
      <Button variant="ghost" size="icon" className={size} icon={ChevronDown} disabled={disabled || index === count - 1} onClick={() => onMove(1)} aria-label="لتحت" title="لتحت" />
    </div>
  );
}
