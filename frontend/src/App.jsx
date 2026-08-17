import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import LeadsList from './pages/leads/LeadsList';
import LeadDetail from './pages/leads/LeadDetail';
import LeadForm from './pages/leads/LeadForm';
import CompaniesList from './pages/companies/CompaniesList';
import Company360 from './pages/companies/Company360';
import ContactsList from './pages/contacts/ContactsList';
import ContactDetail from './pages/contacts/ContactDetail';
import OpportunitiesList from './pages/opportunities/OpportunitiesList';
import OpportunityDetail from './pages/opportunities/OpportunityDetail';
import Activities from './pages/activities/Activities';
import SalesPipeline from './pages/pipeline/SalesPipeline';
import MasterPage from './pages/masters/MasterPage';
import MastersDashboard from './pages/masters/MastersDashboard';
import UsersList from './pages/users/UsersList';
import Roles from './pages/roles/Roles';
import Permissions from './pages/roles/Permissions';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

// Volume 3 & 4 removed as per requirements
import DocumentsList from './pages/documents/DocumentsList';
import EmailCampaigns from './pages/marketing/EmailCampaigns';
import EmailTemplates from './pages/marketing/EmailTemplates';
import WhatsApp from './pages/marketing/WhatsApp';
import WhatsAppCampaigns from './pages/marketing/WhatsAppCampaigns';
import MarketingAutomation from './pages/marketing/MarketingAutomation';
import ApprovalCenter from './pages/workflow/ApprovalCenter';
import AnalyticsDashboard from './pages/reports/AnalyticsDashboard';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/leads" element={<LeadsList />} />
        <Route path="/leads/new" element={<LeadForm />} />
        <Route path="/leads/:id/edit" element={<LeadForm />} />
        <Route path="/leads/:id" element={<LeadDetail />} />

        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/companies/:id" element={<Company360 />} />

        <Route path="/contacts" element={<ContactsList />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />

        <Route path="/opportunities" element={<OpportunitiesList />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />

        <Route path="/activities" element={<Activities />} />
        <Route path="/activities/:view" element={<Activities />} />
        <Route path="/pipeline" element={<SalesPipeline />} />
        

        {/* Volume 4: Documents, Marketing, Workflow, Reports */}
        <Route path="/documents" element={<DocumentsList />} />
        <Route path="/email-campaigns" element={<EmailCampaigns />} />
        <Route path="/email-templates" element={<EmailTemplates />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
        <Route path="/whatsapp-campaigns" element={<WhatsAppCampaigns />} />
        <Route path="/marketing-automation" element={<MarketingAutomation />} />
        <Route path="/approvals" element={<ApprovalCenter />} />
        <Route path="/reports" element={<AnalyticsDashboard />} />
        <Route path="/notifications" element={<Notifications />} />

        <Route path="/masters/dashboard" element={<MastersDashboard />} />
        <Route path="/masters/:type" element={<MasterPage />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/permissions" element={<Permissions />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
// trigger HMR
