import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/common/Ui';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <EmptyState
        icon="bi-compass"
        title="Page not found"
        message="The page you're looking for doesn't exist or has been moved."
        action={<button className="btn btn-primary" onClick={() => navigate('/dashboard')}><i className="bi bi-house" /> Back to Dashboard</button>}
      />
    </div>
  );
}
