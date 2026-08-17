const fs = require('fs');
const path = require('path');

const files = [
  './pages/quotations/QuotationsList.jsx',
  './pages/quotations/QuotationForm.jsx',
  './pages/quotations/QuotationDetail.jsx',
  './pages/proposals/ProposalsList.jsx',
  './pages/proposals/ProposalForm.jsx',
  './pages/proposals/ProposalDetail.jsx',
  './pages/documents/DocumentsList.jsx',
  './pages/marketing/EmailCampaigns.jsx',
  './pages/marketing/WhatsAppCampaigns.jsx',
  './pages/marketing/MarketingAutomation.jsx',
  './pages/workflow/ApprovalCenter.jsx',
  './pages/reports/AnalyticsDashboard.jsx',
];

let allExist = true;
for (const file of files) {
  const fullPath = path.join('d:\\CRM\\frontend\\src', file);
  if (!fs.existsSync(fullPath)) {
    console.log('MISSING:', fullPath);
    allExist = false;
  } else {
    console.log('EXISTS:', fullPath);
  }
}
console.log('All exist?', allExist);
