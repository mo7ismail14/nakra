import { Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        icon={Compass}
        title="الصفحة دي مش موجودة"
        description="ممكن يكون الرابط غلط أو الصفحة اتنقلت."
        action={<Button to="/">الرجوع للرئيسية</Button>}
        className="w-full max-w-md"
      />
    </div>
  );
}
