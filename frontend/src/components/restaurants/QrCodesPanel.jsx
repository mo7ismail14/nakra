import { restaurantsApi } from '../../api/endpoints.js';
import { useApi } from '../../hooks/useApi.js';
import AsyncContent from '../ui/AsyncContent.jsx';
import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import LinkBox from '../ui/LinkBox.jsx';
import QrCard from './QrCard.jsx';

const CODES = [
  { key: 'menu', title: 'المنيو', description: 'الزبون يمسحه يفتح المنيو على موبايله.' },
  { key: 'instapay', title: 'إنستاباي', description: 'يفتح لينك الدفع بإنستاباي.' },
  { key: 'vodafoneCash', title: 'فودافون كاش', description: 'فيه رقم محفظة فودافون كاش.' },
  { key: 'vodafoneCashInstapay', title: 'فودافون كاش عن طريق إنستاباي', description: 'الدفع على المحفظة من خلال إنستاباي.' },
];

export default function QrCodesPanel({ restaurant, onEditPayments }) {
  const query = useApi(() => restaurantsApi.qrCodes(restaurant.id), [restaurant.id, restaurant.updatedAt]);

  return (
    <div className="space-y-6">
      <Card title="رابط المنيو" description="ده الرابط اللي بيفتحه الزبون، وهو نفسه اللي في الـ QR.">
        <LinkBox url={restaurant.menuUrl} openable />
      </Card>

      <AsyncContent query={query}>
        {({ qrCodes }) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CODES.map(({ key, title, description }) => (
              <QrCard
                key={key}
                title={title}
                description={description}
                qr={qrCodes[key]}
                fileName={`${restaurant.slug}-${key}`}
                emptyText="البيانات دي لسه ما اتضافتش."
                emptyAction={
                  <Button variant="secondary" size="sm" onClick={onEditPayments}>
                    إضافة وسيلة الدفع
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </AsyncContent>
    </div>
  );
}
