import { Card } from './ui/Card';
import { InboxIllustration } from './illustrations';

const EmptyState = ({ illustration: Illustration = InboxIllustration, icon: Icon, title = 'Nothing here yet', message, action }) => (
  <Card className="flex flex-col items-center justify-center border-dashed bg-card/50 py-16 text-center">
    <div className="mb-5 text-primary/70">
      {Illustration ? <Illustration className="h-32 w-44" /> : Icon ? <Icon className="h-12 w-12" /> : null}
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {message && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </Card>
);

export default EmptyState;
