import PageHeader from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/Ui';

export default function EmailTemplates() {
  return (
    <div className="page">
      <PageHeader
        title="Email Templates"
        subtitle="Manage and create email templates"
        icon="bi-window-stack"
        actions={<button className="btn btn-primary"><i className="bi bi-plus-lg" /> New Template</button>}
      />
      <EmptyState
        icon="bi-window-stack"
        title="No templates found"
        message="Get started by creating your first email template."
      />
    </div>
  );
}
