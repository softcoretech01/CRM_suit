import PageHeader from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/Ui';

export default function WhatsApp() {
  return (
    <div className="page">
      <PageHeader
        title="WhatsApp Messaging"
        subtitle="Connect and send WhatsApp messages directly to customers"
        icon="bi-whatsapp"
      />
      <EmptyState
        icon="bi-whatsapp"
        title="No messages found"
        message="Your WhatsApp chat history will appear here."
      />
    </div>
  );
}
