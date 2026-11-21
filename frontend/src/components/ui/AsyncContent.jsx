import { RefreshCw } from 'lucide-react';
import Alert from './Alert.jsx';
import Button from './Button.jsx';
import { PageLoader } from './Spinner.jsx';

/**
 * Renders loading / error for a useApi() result, then children(data).
 *   <AsyncContent query={query}>{(data) => <List items={data.items} />}</AsyncContent>
 */
export default function AsyncContent({ query, children, loader = <PageLoader /> }) {
  if (query.loading && !query.data) return loader;
  if (query.error) {
    return (
      <Alert variant="error" title="مقدرناش نحمّل البيانات">
        <p>{query.error.message}</p>
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={query.reload} className="mt-2">
          حاول تاني
        </Button>
      </Alert>
    );
  }
  return children(query.data);
}
