import PageHeader from '../components/common/PageHeader';
import { EmptyState } from '../components/common/Ui';

export default function Notifications() {
  return (
    <div className="page">
      <PageHeader
        title="Notifications"
        subtitle="System alerts and updates"
        icon="bi-bell"
      />
      <EmptyState
        icon="bi-bell-slash"
        title="No new notifications"
        message="You are all caught up!"
      />
    </div>
  );
}
