// ============================================================
// TECHSPIRE CRM — Mock data (Volume 1 + Volume 2)
// Realistic Indian business data. No real personal data.
// ============================================================

import { PORTALS } from '../config/portals';

export const currentUser = {
  id: 'USR-001',
  name: 'Rajesh Menon',
  designation: 'Sales Manager',
  department: 'Sales',
  branch: 'Coimbatore HQ',
  email: 'rajesh.menon@techspire.in',
  mobile: '+91 98430 12345',
  role: 'Sales Manager',
  avatarColor: '#2563eb',
};

// ---------- Users ----------
export const users = [];

export const salespeople = [];

// ---------- Roles & Permissions ----------
export const roles = [];


// ---------- Companies ----------
export const companies = [];

// ---------- Contacts ----------
export const contacts = [];

// ---------- Master data ----------
export const products = [
  { code: 'PRD-01', name: 'Manufacturing ERP', category: 'ERP', description: 'End-to-end manufacturing resource planning', status: 'Active' },
  { code: 'PRD-02', name: 'Hospital ERP', category: 'ERP', description: 'Hospital and healthcare management suite', status: 'Active' },
  { code: 'PRD-03', name: 'HRMS', category: 'HR', description: 'Human resource management system', status: 'Active' },
  { code: 'PRD-04', name: 'Payroll', category: 'HR', description: 'Payroll processing and compliance', status: 'Active' },
  { code: 'PRD-05', name: 'Rental ERP', category: 'ERP', description: 'Equipment and asset rental management', status: 'Active' },
  { code: 'PRD-06', name: 'Windmill Management', category: 'Energy', description: 'Windmill operations and monitoring', status: 'Active' },
  { code: 'PRD-07', name: 'Solar ERP', category: 'Energy', description: 'Solar project and EPC management', status: 'Active' },
  { code: 'PRD-08', name: 'Inventory', category: 'ERP', description: 'Inventory and warehouse management', status: 'Active' },
  { code: 'PRD-09', name: 'Finance', category: 'ERP', description: 'Financial accounting and reporting', status: 'Active' },
  { code: 'PRD-10', name: 'CRM', category: 'Sales', description: 'Customer relationship management', status: 'Active' },
  { code: 'PRD-11', name: 'Website Development', category: 'Services', description: 'Custom website design and development', status: 'Active' },
  { code: 'PRD-12', name: 'Mobile App', category: 'Services', description: 'Native and cross-platform mobile apps', status: 'Active' },
  { code: 'PRD-13', name: 'Digital Marketing', category: 'Services', description: 'SEO, ads and social media marketing', status: 'Active' },
  { code: 'PRD-14', name: 'AI Services', category: 'Services', description: 'AI and machine learning solutions', status: 'Active' },
  { code: 'PRD-15', name: 'Custom Software', category: 'Services', description: 'Bespoke software development', status: 'Active' },
  { code: 'PRD-16', name: 'AMC', category: 'Support', description: 'Annual maintenance contracts', status: 'Active' },
  { code: 'PRD-17', name: 'Cloud Hosting', category: 'Infrastructure', description: 'Managed cloud hosting services', status: 'Active' },
];

export const industries = [
  'Manufacturing', 'Healthcare', 'Engineering', 'Textiles', 'Renewable Energy',
  'FMCG', 'Rental Services', 'Automotive', 'Information Technology', 'Retail',
  'Education', 'Logistics', 'Construction', 'Hospitality',
].map((n, i) => ({ code: `IND-${String(i + 1).padStart(2, '0')}`, name: n, description: `Master data for ${n}`, status: 'Active' }));

export const leadSources = [
  'Website', 'Google Ads', 'Meta Ads', 'Facebook', 'Instagram', 'LinkedIn',
  'Referral', 'BNI', 'Cold Calling', 'Email Campaign', 'Walk-In', 'Trade Fair',
  'Existing Customer', 'Partner', 'Website Chat', 'WhatsApp',
].map((n, i) => ({ code: `SRC-${String(i + 1).padStart(2, '0')}`, name: n, description: `Lead source via ${n}`, status: 'Active' }));

export const campaigns = [
  { code: 'CAM-01', name: 'ERP Growth Q3 2026', channel: 'Google Ads', description: 'Growth campaign', status: 'Active' },
  { code: 'CAM-02', name: 'Healthcare Digital 2026', channel: 'LinkedIn', description: 'Digital presence', status: 'Active' },
  { code: 'CAM-03', name: 'Renewable Energy Expo', channel: 'Trade Fair', description: 'Expo marketing', status: 'Active' },
  { code: 'CAM-04', name: 'Textile Automation Webinar', channel: 'Email Campaign', description: 'Webinar promo', status: 'Active' },
  { code: 'CAM-05', name: 'SME Digital Transformation', channel: 'Meta Ads', description: 'SME outreach', status: 'Paused' },
  { code: 'CAM-06', name: 'Referral Rewards Program', channel: 'Referral', description: 'Referral push', status: 'Active' },
];

export const activityTypes = [
  { code: 'ACT-01', name: 'Call', icon: 'bi-telephone', description: 'Phone call', status: 'Active' },
  { code: 'ACT-02', name: 'Email', icon: 'bi-envelope', description: 'Email outreach', status: 'Active' },
  { code: 'ACT-03', name: 'Meeting', icon: 'bi-people', description: 'In-person meeting', status: 'Active' },
  { code: 'ACT-04', name: 'Visit', icon: 'bi-geo-alt', description: 'Site visit', status: 'Active' },
  { code: 'ACT-05', name: 'WhatsApp', icon: 'bi-whatsapp', description: 'WhatsApp message', status: 'Active' },
  { code: 'ACT-06', name: 'Demo', icon: 'bi-easel', description: 'Product demo', status: 'Active' },
  { code: 'ACT-07', name: 'Proposal', icon: 'bi-file-earmark-text', description: 'Sent proposal', status: 'Active' },
  { code: 'ACT-08', name: 'Task', icon: 'bi-check2-square', description: 'Internal task', status: 'Active' },
  { code: 'ACT-09', name: 'Note', icon: 'bi-sticky', description: 'Internal note', status: 'Active' },
];

export const leadStatuses = [
  { id: 1, code: 'LS-01', name: 'New', color: 'tone-blue', description: 'Fresh lead, untouched', status: 'Active' },
  { id: 2, code: 'LS-02', name: 'Qualified', color: 'tone-amber', description: 'Requirement understood, ready to pitch', status: 'Active' },
  { id: 3, code: 'LS-03', name: 'Negotiation', color: 'tone-purple', description: 'Price / terms discussion', status: 'Active' },
  { id: 4, code: 'LS-04', name: 'Converted', color: 'tone-green', description: 'Successfully became an Opportunity', status: 'Active' },
  { id: 5, code: 'LS-05', name: 'Lost', color: 'tone-red', description: 'Lead dropped or disqualified', status: 'Active' },
];

export const nextActions = [
  'Call', 'Send Email', 'Schedule Meeting', 'Send Proposal', 'Product Demo',
  'Site Visit', 'Follow-up', 'Send Quotation', 'Await PO', 'Close Deal',
].map((n, i) => ({ code: `NA-${String(i + 1).padStart(2, '0')}`, name: n, description: `Standard action: ${n}`, status: 'Active' }));

export const priorities = [
  { code: 'PRI-01', name: 'High', color: 'tone-red', description: 'High priority', status: 'Active' },
  { code: 'PRI-02', name: 'Medium', color: 'tone-amber', description: 'Medium priority', status: 'Active' },
  { code: 'PRI-03', name: 'Low', color: 'tone-gray', description: 'Low priority', status: 'Active' },
];

export const countries = [
  { code: 'IN', name: 'India', description: 'Country: India', status: 'Active' },
  { code: 'AE', name: 'United Arab Emirates', description: 'Country: UAE', status: 'Active' },
  { code: 'US', name: 'United States', description: 'Country: USA', status: 'Active' },
  { code: 'GB', name: 'United Kingdom', description: 'Country: UK', status: 'Active' },
  { code: 'SG', name: 'Singapore', description: 'Country: Singapore', status: 'Active' },
];

export const states = [
  { code: 'TN', name: 'Tamil Nadu', country: 'India', description: 'State in India', status: 'Active' },
  { code: 'KA', name: 'Karnataka', country: 'India', description: 'State in India', status: 'Active' },
  { code: 'KL', name: 'Kerala', country: 'India', description: 'State in India', status: 'Active' },
  { code: 'TG', name: 'Telangana', country: 'India', description: 'State in India', status: 'Active' },
  { code: 'MH', name: 'Maharashtra', country: 'India', description: 'State in India', status: 'Active' },
  { code: 'AP', name: 'Andhra Pradesh', country: 'India', description: 'State in India', status: 'Active' },
];

export const cities = [
  { code: 'CBE', name: 'Coimbatore', state: 'Tamil Nadu', description: 'City in Tamil Nadu', status: 'Active' },
  { code: 'MAA', name: 'Chennai', state: 'Tamil Nadu', description: 'City in Tamil Nadu', status: 'Active' },
  { code: 'TUP', name: 'Tirupur', state: 'Tamil Nadu', description: 'City in Tamil Nadu', status: 'Active' },
  { code: 'BLR', name: 'Bengaluru', state: 'Karnataka', description: 'City in Karnataka', status: 'Active' },
  { code: 'MYS', name: 'Mysuru', state: 'Karnataka', description: 'City in Karnataka', status: 'Active' },
  { code: 'COK', name: 'Kochi', state: 'Kerala', description: 'City in Kerala', status: 'Active' },
  { code: 'TVM', name: 'Thiruvananthapuram', state: 'Kerala', description: 'City in Kerala', status: 'Active' },
  { code: 'HYD', name: 'Hyderabad', state: 'Telangana', description: 'City in Telangana', status: 'Active' },
];

// ---------- Leads ----------
export const leads = [
  { id: 'LEAD-001', number: 'LEAD-001', date: '2026-08-02', company: 'ABC Manufacturing Pvt Ltd', companyId: 'CMP-001', contact: 'Arun Prakash', contactMobile: '+91 98431 20034', contactEmail: 'arun.prakash@abcmanufacturing.in', industry: 'Manufacturing', source: 'Referral', campaign: 'Referral Rewards Program', product: 'Manufacturing ERP', products: ['Manufacturing ERP', 'Inventory'], assignedTo: 'Arun Kumar', status: 'Qualified', temperature: 'Hot', score: 72, value: 2500000, closing: '2026-09-30', budget: 3000000, decisionMaker: 'Arun Prakash', competitors: 'SAP Business One', requirement: 'Replace legacy system with integrated manufacturing ERP covering production, inventory and finance.', nextAction: 'Product Demo', nextActionDate: '2026-08-13', lastActivity: '2026-08-11', priority: 'High', utmSource: 'referral', utmMedium: 'partner', utmCampaign: 'rewards_q3' },
  { id: 'LEAD-002', number: 'LEAD-002', date: '2026-08-04', company: 'Sri Lakshmi Hospitals', companyId: 'CMP-002', contact: 'Dr. Ramesh Chandran', contactMobile: '+91 98410 55621', contactEmail: 'ramesh.c@srilakshmihospitals.com', industry: 'Healthcare', source: 'LinkedIn', campaign: 'Healthcare Digital 2026', product: 'Hospital ERP', products: ['Hospital ERP'], assignedTo: 'Priya Sharma', status: 'Qualified', temperature: 'Hot', score: 81, value: 4200000, closing: '2026-10-15', budget: 5000000, decisionMaker: 'Dr. Ramesh Chandran', competitors: 'Medeil, Birlamedisoft', requirement: 'Hospital-wide ERP with OP/IP, pharmacy, billing and lab integration.', nextAction: 'Send Proposal', nextActionDate: '2026-08-14', lastActivity: '2026-08-10', priority: 'High', utmSource: 'linkedin', utmMedium: 'social', utmCampaign: 'healthcare_2026' },
  { id: 'LEAD-003', number: 'LEAD-003', date: '2026-08-05', company: 'GreenTech Engineering', companyId: 'CMP-003', contact: 'Vinod Krishnan', contactMobile: '+91 90032 11458', contactEmail: 'vinod@greentecheng.in', industry: 'Engineering', source: 'Website', campaign: 'ERP Growth Q3 2026', product: 'Custom Software', products: ['Custom Software', 'CRM'], assignedTo: 'Karthik Raja', status: 'Qualified', temperature: 'Warm', score: 48, value: 1200000, closing: '2026-11-05', budget: 1500000, decisionMaker: 'Vinod Krishnan', competitors: '', requirement: 'Custom project tracking and CRM for engineering projects.', nextAction: 'Schedule Meeting', nextActionDate: '2026-08-15', lastActivity: '2026-08-09', priority: 'Medium', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'erp_growth_q3' },
  { id: 'LEAD-004', number: 'LEAD-004', date: '2026-08-06', company: 'Prime Textile Industries', companyId: 'CMP-004', contact: 'Priyanka Reddy', contactMobile: '+91 98942 30012', contactEmail: 'priyanka.reddy@primetextiles.co.in', industry: 'Textiles', source: 'Trade Fair', campaign: 'Textile Automation Webinar', product: 'Manufacturing ERP', products: ['Manufacturing ERP', 'HRMS', 'Payroll'], assignedTo: 'Arun Kumar', status: 'Qualified', temperature: 'Hot', score: 76, value: 6800000, closing: '2026-09-20', budget: 7500000, decisionMaker: 'Priyanka Reddy', competitors: 'Oracle NetSuite', requirement: 'Integrated ERP with HRMS and payroll for 2400 employees across 3 units.', nextAction: 'Send Quotation', nextActionDate: '2026-08-13', lastActivity: '2026-08-11', priority: 'High', utmSource: 'tradefair', utmMedium: 'event', utmCampaign: 'textile_automation' },
  { id: 'LEAD-005', number: 'LEAD-005', date: '2026-08-07', company: 'Kovai Engineering Works', companyId: 'CMP-005', contact: 'Mahesh Gupta', contactMobile: '+91 95669 44120', contactEmail: 'mahesh@kovaiengg.in', industry: 'Manufacturing', source: 'Cold Calling', campaign: '', product: 'Inventory', products: ['Inventory', 'Finance'], assignedTo: 'Divya Lakshmi', status: 'Qualified', temperature: 'Cold', score: 18, value: 450000, closing: '2026-12-10', budget: 600000, decisionMaker: 'Mahesh Gupta', competitors: '', requirement: 'Basic inventory and finance for small workshop.', nextAction: 'Call', nextActionDate: '2026-08-12', lastActivity: '2026-08-07', priority: 'Low', utmSource: '', utmMedium: '', utmCampaign: '' },
  { id: 'LEAD-006', number: 'LEAD-006', date: '2026-08-08', company: 'SunPower Energy Solutions', companyId: 'CMP-006', contact: 'Deepak Varma', contactMobile: '+91 90007 88231', contactEmail: 'deepak.varma@sunpowerenergy.in', industry: 'Renewable Energy', source: 'Trade Fair', campaign: 'Renewable Energy Expo', product: 'Solar ERP', products: ['Solar ERP'], assignedTo: 'Karthik Raja', status: 'Qualified', temperature: 'Hot', score: 84, value: 3600000, closing: '2026-08-28', budget: 4000000, decisionMaker: 'Deepak Varma', competitors: 'In-house team', requirement: 'Solar EPC project management with procurement and site tracking.', nextAction: 'Close Deal', nextActionDate: '2026-08-13', lastActivity: '2026-08-11', priority: 'High', utmSource: 'expo', utmMedium: 'event', utmCampaign: 'renewable_expo' },
  { id: 'LEAD-007', number: 'LEAD-007', date: '2026-08-08', company: 'Malabar Spices Exports', companyId: 'CMP-007', contact: 'Fathima Beevi', contactMobile: '+91 94470 33218', contactEmail: 'fathima@malabarspices.com', industry: 'FMCG', source: 'Referral', campaign: 'Referral Rewards Program', product: 'Inventory', products: ['Inventory', 'Finance'], assignedTo: 'Priya Sharma', status: 'Qualified', temperature: 'Warm', score: 55, value: 900000, closing: '2026-10-30', budget: 1100000, decisionMaker: 'Fathima Beevi', competitors: 'Tally', requirement: 'Export inventory with batch tracking and finance.', nextAction: 'Follow-up', nextActionDate: '2026-08-16', lastActivity: '2026-08-08', priority: 'Medium', utmSource: 'referral', utmMedium: 'partner', utmCampaign: 'rewards_q3' },
  { id: 'LEAD-008', number: 'LEAD-008', date: '2026-07-28', company: 'Nova Rentals & Equipment', companyId: 'CMP-008', contact: 'Rohan Shetty', contactMobile: '+91 90080 12245', contactEmail: 'rohan@novarentals.in', industry: 'Rental Services', source: 'Website Chat', campaign: 'SME Digital Transformation', product: 'Rental ERP', products: ['Rental ERP'], assignedTo: 'Karthik Raja', status: 'Qualified', temperature: 'Warm', score: 42, value: 1400000, closing: '2026-11-15', budget: 1600000, decisionMaker: 'Rohan Shetty', competitors: '', requirement: 'Rental ERP for equipment fleet with GPS and billing.', nextAction: 'Call', nextActionDate: '2026-08-12', lastActivity: '2026-08-06', priority: 'Medium', utmSource: 'meta', utmMedium: 'social', utmCampaign: 'sme_digital' },
  { id: 'LEAD-009', number: 'LEAD-009', date: '2026-07-25', company: 'Anand Motors Group', companyId: 'CMP-009', contact: 'Anand Subramaniam', contactMobile: '+91 98942 11009', contactEmail: 'anand@anandmotors.co.in', industry: 'Automotive', source: 'Existing Customer', campaign: '', product: 'CRM', products: ['CRM', 'Digital Marketing'], assignedTo: 'Divya Lakshmi', status: 'Converted', temperature: 'Hot', score: 88, value: 1800000, closing: '2026-08-05', budget: 2000000, decisionMaker: 'Anand Subramaniam', competitors: 'Zoho', requirement: 'CRM with lead tracking for dealership network + digital marketing.', nextAction: 'Close Deal', nextActionDate: '2026-08-05', lastActivity: '2026-08-05', priority: 'High', utmSource: '', utmMedium: '', utmCampaign: '' },
  { id: 'LEAD-010', number: 'LEAD-010', date: '2026-07-20', company: 'Windward Power Systems', companyId: 'CMP-010', contact: 'Ganesh Iyer', contactMobile: '+91 98433 66712', contactEmail: 'ganesh@windwardpower.in', industry: 'Renewable Energy', source: 'BNI', campaign: 'Renewable Energy Expo', product: 'Windmill Management', products: ['Windmill Management'], assignedTo: 'Arun Kumar', status: 'Qualified', temperature: 'Cold', score: 15, value: 2200000, closing: '2026-07-31', budget: 0, lossReason: 'Budget', decisionMaker: 'Ganesh Iyer', competitors: 'In-house', requirement: 'Windmill monitoring and maintenance management.', nextAction: '—', nextActionDate: '', lastActivity: '2026-07-30', priority: 'Low', utmSource: 'bni', utmMedium: 'network', utmCampaign: 'renewable_expo' },
];

// ---------- Opportunities ----------
export const opportunities = [
  { id: 'OPP-001', number: 'OPP-001', name: 'Manufacturing ERP Implementation', company: 'ABC Manufacturing Pvt Ltd', companyId: 'CMP-001', contact: 'Arun Prakash', product: 'Manufacturing ERP', stage: 'Proposal', probability: 90, value: 2500000, currency: 'INR', closing: '2026-09-30', priority: 'High', risk: 'Medium', competitor: 'SAP Business One', remarks: 'Final commercial negotiation in progress.', leadId: 'LEAD-001' },
  { id: 'OPP-002', number: 'OPP-002', name: 'Hospital ERP Suite', company: 'Sri Lakshmi Hospitals', companyId: 'CMP-002', contact: 'Dr. Ramesh Chandran', product: 'Hospital ERP', stage: 'Proposal', probability: 70, value: 4200000, currency: 'INR', closing: '2026-10-15', priority: 'High', risk: 'Low', competitor: 'Medeil', remarks: 'Proposal submitted, awaiting board review.', leadId: 'LEAD-002' },
  { id: 'OPP-003', number: 'OPP-003', name: 'Textile ERP + HRMS Rollout', company: 'Prime Textile Industries', companyId: 'CMP-004', contact: 'Priyanka Reddy', product: 'Manufacturing ERP', stage: 'Proposal', probability: 70, value: 6800000, currency: 'INR', closing: '2026-09-20', priority: 'High', risk: 'Medium', competitor: 'Oracle NetSuite', remarks: 'Largest deal in pipeline, multi-unit rollout.', leadId: 'LEAD-004' },
  { id: 'OPP-004', number: 'OPP-004', name: 'Solar EPC Management', company: 'SunPower Energy Solutions', companyId: 'CMP-006', contact: 'Deepak Varma', product: 'Solar ERP', stage: 'Proposal', probability: 90, value: 3600000, currency: 'INR', closing: '2026-08-28', priority: 'High', risk: 'Low', competitor: 'In-house team', remarks: 'PO expected within two weeks.', leadId: 'LEAD-006' },
  { id: 'OPP-005', number: 'OPP-005', name: 'Export Inventory & Finance', company: 'Malabar Spices Exports', companyId: 'CMP-007', contact: 'Fathima Beevi', product: 'Inventory', stage: 'Demo', probability: 50, value: 900000, currency: 'INR', closing: '2026-10-30', priority: 'Medium', risk: 'Medium', competitor: 'Tally', remarks: 'Demo scheduled for batch tracking module.', leadId: 'LEAD-007' },
  { id: 'OPP-006', number: 'OPP-006', name: 'Rental Fleet ERP', company: 'Nova Rentals & Equipment', companyId: 'CMP-008', contact: 'Rohan Shetty', product: 'Rental ERP', stage: 'Qualification', probability: 10, value: 1400000, currency: 'INR', closing: '2026-11-15', priority: 'Medium', risk: 'High', competitor: '', remarks: 'Early stage, qualifying requirements.', leadId: 'LEAD-008' },
  { id: 'OPP-007', number: 'OPP-007', name: 'Dealership CRM & Marketing', company: 'Anand Motors Group', companyId: 'CMP-009', contact: 'Anand Subramaniam', product: 'CRM', stage: 'Won', probability: 100, value: 1800000, currency: 'INR', closing: '2026-08-05', priority: 'High', risk: 'Low', competitor: 'Zoho', remarks: 'Deal closed, implementation kickoff scheduled.', leadId: 'LEAD-009' },
  { id: 'OPP-008', number: 'OPP-008', name: 'Engineering Project Suite', company: 'GreenTech Engineering', companyId: 'CMP-003', contact: 'Vinod Krishnan', product: 'Custom Software', stage: 'Requirement', probability: 30, value: 1200000, currency: 'INR', closing: '2026-11-05', priority: 'Medium', risk: 'Medium', competitor: '', remarks: 'Gathering detailed requirements.', leadId: 'LEAD-003' },
];

// ---------- Activities ----------
export const activities = [
  { id: 'ACT-001', type: 'Call', subject: 'Discovery call on ERP requirements', lead: 'LEAD-001', company: 'ABC Manufacturing Pvt Ltd', contact: 'Arun Prakash', opportunity: 'OPP-001', date: '2026-08-11', time: '10:30', duration: '35 min', direction: 'Outbound', conductedBy: 'Arun Kumar', priority: 'High', status: 'Completed', outcome: 'Demo Requested', nextAction: 'Product Demo', reminder: '2026-08-13 10:00', summary: 'Discussed production and inventory pain points. Customer keen on demo.' },
  { id: 'ACT-002', type: 'Meeting', subject: 'Requirement workshop', lead: 'LEAD-002', company: 'Sri Lakshmi Hospitals', contact: 'Dr. Ramesh Chandran', opportunity: 'OPP-002', date: '2026-08-10', time: '14:00', duration: '90 min', mode: 'Customer Site', location: 'Sri Lakshmi Hospitals, Coimbatore', conductedBy: 'Priya Sharma', priority: 'High', status: 'Completed', outcome: 'Interested', nextAction: 'Send Proposal', reminder: '2026-08-14 09:00', summary: 'Walked through OP/IP and pharmacy modules with department heads.' },
  { id: 'ACT-003', type: 'Demo', subject: 'Solar ERP product demo', lead: 'LEAD-006', company: 'SunPower Energy Solutions', contact: 'Deepak Varma', opportunity: 'OPP-004', date: '2026-08-11', time: '11:00', duration: '60 min', mode: 'Google Meet', conductedBy: 'Karthik Raja', priority: 'High', status: 'Completed', outcome: 'Proposal Requested', nextAction: 'Close Deal', reminder: '2026-08-13 15:00', summary: 'Demonstrated project and procurement tracking. Strong positive response.' },
  { id: 'ACT-004', type: 'Call', subject: 'Follow-up on proposal', lead: 'LEAD-004', company: 'Prime Textile Industries', contact: 'Priyanka Reddy', opportunity: 'OPP-003', date: '2026-08-13', time: '11:30', duration: '', direction: 'Outbound', conductedBy: 'Arun Kumar', priority: 'High', status: 'Pending', outcome: '', nextAction: 'Send Quotation', reminder: '2026-08-13 11:00', summary: '' },
  { id: 'ACT-005', type: 'Task', subject: 'Prepare quotation for textile ERP', lead: 'LEAD-004', company: 'Prime Textile Industries', contact: 'Priyanka Reddy', opportunity: 'OPP-003', date: '2026-08-12', time: '16:00', duration: '', conductedBy: 'Arun Kumar', priority: 'High', status: 'Pending', outcome: '', nextAction: 'Send Quotation', reminder: '2026-08-12 15:00', summary: '' },
  { id: 'ACT-006', type: 'WhatsApp', subject: 'Shared brochure and pricing', lead: 'LEAD-007', company: 'Malabar Spices Exports', contact: 'Fathima Beevi', opportunity: 'OPP-005', date: '2026-08-08', time: '09:15', duration: '', conductedBy: 'Priya Sharma', priority: 'Medium', status: 'Completed', outcome: 'Interested', nextAction: 'Follow-up', reminder: '2026-08-16 10:00', summary: 'Sent product brochure and indicative pricing on WhatsApp.' },
  { id: 'ACT-007', type: 'Call', subject: 'Introductory call', lead: 'LEAD-008', company: 'Nova Rentals & Equipment', contact: 'Rohan Shetty', opportunity: 'OPP-006', date: '2026-08-12', time: '15:00', duration: '', direction: 'Outbound', conductedBy: 'Karthik Raja', priority: 'Medium', status: 'Pending', outcome: '', nextAction: 'Call', reminder: '2026-08-12 14:30', summary: '' },
  { id: 'ACT-008', type: 'Email', subject: 'Sent qualification questionnaire', lead: 'LEAD-003', company: 'GreenTech Engineering', contact: 'Vinod Krishnan', opportunity: 'OPP-008', date: '2026-08-09', time: '17:20', duration: '', conductedBy: 'Karthik Raja', priority: 'Medium', status: 'Completed', outcome: 'Interested', nextAction: 'Schedule Meeting', reminder: '2026-08-15 10:00', summary: 'Emailed detailed requirement questionnaire.' },
  { id: 'ACT-009', type: 'Call', subject: 'Cold call — inventory needs', lead: 'LEAD-005', company: 'Kovai Engineering Works', contact: 'Mahesh Gupta', opportunity: '', date: '2026-08-12', time: '10:00', duration: '', direction: 'Outbound', conductedBy: 'Divya Lakshmi', priority: 'Low', status: 'Pending', outcome: '', nextAction: 'Call', reminder: '2026-08-12 09:45', summary: '' },
  { id: 'ACT-010', type: 'Visit', subject: 'Site visit for requirement study', lead: 'LEAD-001', company: 'ABC Manufacturing Pvt Ltd', contact: 'Lakshmi Narayanan', opportunity: 'OPP-001', date: '2026-08-14', time: '11:00', duration: '', mode: 'Customer Site', location: 'ABC Manufacturing, SIDCO Estate', conductedBy: 'Arun Kumar', priority: 'High', status: 'Pending', outcome: '', nextAction: 'Site Visit', reminder: '2026-08-14 10:00', summary: '' },
];

// ---------- Notifications ----------
export const notifications = [
  { id: 'N1', type: 'followup', title: "Today's Follow-ups", detail: '3 pending follow-ups need attention', time: '2h ago', icon: 'bi-bell', tone: 'tone-amber' },
  { id: 'N2', type: 'meeting', title: 'Upcoming Meetings', detail: '2 meetings scheduled today', time: '3h ago', icon: 'bi-calendar-event', tone: 'tone-blue' },
  { id: 'N3', type: 'overdue', title: 'Overdue Activities', detail: '5 activities require attention', time: '5h ago', icon: 'bi-exclamation-triangle', tone: 'tone-red' },
  { id: 'N4', type: 'lead', title: 'New Lead Assigned', detail: 'Nova Rentals & Equipment assigned to you', time: 'Yesterday', icon: 'bi-person-plus', tone: 'tone-green' },
  { id: 'N5', type: 'won', title: 'Deal Won', detail: 'Anand Motors Group — ₹18 Lakhs', time: 'Yesterday', icon: 'bi-trophy', tone: 'tone-green' },
];

// ---------- Audit trail (sample) ----------
export const auditTrail = [
  { date: '2026-08-11', time: '10:42 AM', user: 'Arun Kumar', action: 'Changed Lead Status', from: 'Contacted', to: 'Qualified', entity: 'LEAD-000124' },
  { date: '2026-08-11', time: '10:30 AM', user: 'Arun Kumar', action: 'Logged Call activity', from: '', to: 'Demo Requested', entity: 'LEAD-000124' },
  { date: '2026-08-09', time: '09:15 AM', user: 'Rajesh Menon', action: 'Assigned lead', from: 'Unassigned', to: 'Arun Kumar', entity: 'LEAD-000124' },
  { date: '2026-08-02', time: '04:20 PM', user: 'Meera Iyer', action: 'Created lead', from: '', to: 'New', entity: 'LEAD-000124' },
];

// ============================================================
// VOLUME 3 & 4 DATA
// ============================================================

// ---------- Follow-ups ----------
export const followUps = [
  { id: 'FU-001', type: 'Call', subject: 'Discuss final requirement', date: '2026-08-16', time: '11:00 AM', assignedTo: 'Arun Kumar', priority: 'High', status: 'Pending', reminder: '15 minutes', relatedEntityId: 'LEAD-001', relatedEntityType: 'Lead' },
  { id: 'FU-002', type: 'Demo', subject: 'ERP Product Demonstration', date: '2026-08-18', time: '02:30 PM', assignedTo: 'Priya Sharma', priority: 'High', status: 'Pending', reminder: '1 hour', relatedEntityId: 'OPP-002', relatedEntityType: 'Opportunity' },
  { id: 'FU-003', type: 'Meeting', subject: 'Initial prospect meeting', date: '2026-08-13', time: '10:00 AM', assignedTo: 'Rajesh Menon', priority: 'Medium', status: 'Overdue', reminder: 'No Reminder', relatedEntityId: 'CMP-008', relatedEntityType: 'Company' }
];

// ---------- Documents ----------
export const documents = [
  { id: 'DOC-101', number: 'NDA-001', name: 'ABC Mfg Mutual NDA', type: 'NDA', category: 'LEGAL', company: 'ABC Manufacturing Pvt Ltd', companyId: 'CMP-1001', opportunity: 'OPP-3001', uploadedBy: 'Arun Kumar', uploadDate: '2026-08-02', version: 'v1', expiryDate: '2027-08-02', tags: ['NDA', 'Legal'], status: 'Active', size: '2.4 MB', fileType: 'pdf' },
  { id: 'DOC-102', number: 'REQ-0008', name: 'Sri Lakshmi Requirements Specs', type: 'Requirement Document', category: 'TECHNICAL', company: 'Sri Lakshmi Hospitals', companyId: 'CMP-1002', opportunity: 'OPP-3002', uploadedBy: 'Priya Sharma', uploadDate: '2026-08-05', version: 'v2', expiryDate: '', tags: ['Specs', 'Technical'], status: 'Active', size: '5.1 MB', fileType: 'pdf' },
  { id: 'DOC-103', number: 'PO-2026-0012', name: 'Anand Motors PO - CRM', type: 'Purchase Order', category: 'COMMERCIAL', company: 'Anand Motors Group', companyId: 'CMP-1009', opportunity: 'OPP-3007', uploadedBy: 'Divya Lakshmi', uploadDate: '2026-08-05', version: 'v1', expiryDate: '', tags: ['PO', 'Commercial'], status: 'Active', size: '1.2 MB', fileType: 'pdf' }
];

// ---------- Email Campaigns ----------
export const emailCampaigns = [
  { id: 'EC-001', code: 'CMP-2026-014', name: 'ERP Modernization Q3', product: 'Manufacturing ERP', audience: 'Manufacturing SMEs', startDate: '2026-08-01', endDate: '2026-08-31', status: 'Sent', sent: 2450, delivered: 2410, opened: 1205, clicked: 480, replied: 45, bounced: 40, unsubscribed: 12, converted: 8 },
  { id: 'EC-002', code: 'CMP-2026-015', name: 'Healthcare Automation Webinar', product: 'Hospital ERP', audience: 'Healthcare Directors', startDate: '2026-08-15', endDate: '2026-08-16', status: 'Scheduled', sent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, unsubscribed: 0, converted: 0 }
];

// ---------- Email Templates ----------
export const emailTemplates = [
  { id: 'TPL-01', name: 'Welcome to Techspire CRM', category: 'Welcome Email', subject: 'Welcome {{CustomerName}}!', content: 'Hello {{CustomerName}},\n\nThank you for choosing Techspire CRM.' },
  { id: 'TPL-02', name: 'Proposal Submission', category: 'Proposal Submission', subject: 'Proposal from Techspire for {{CompanyName}}', content: 'Dear {{CustomerName}},\n\nPlease find attached the proposal for {{ProductName}}.' }
];

// ---------- WhatsApp ----------
export const whatsappConversations = [
  {
    id: 'WA-001', customer: 'Arun Prakash', company: 'ABC Manufacturing Pvt Ltd', lastMessage: 'Can we schedule a demo for tomorrow?', time: '10:45 AM', unread: 1, status: 'Active',
    messages: [
      { id: 'M1', sender: 'Agent', text: 'Hi Arun, I have shared the brochure as requested.', time: '09:30 AM', status: 'Read' },
      { id: 'M2', sender: 'Customer', text: 'Thanks. Can we schedule a demo for tomorrow?', time: '10:45 AM', status: 'Received' }
    ]
  },
  {
    id: 'WA-002', customer: 'Deepak Varma', company: 'SunPower Energy Solutions', lastMessage: 'Received the pricing.', time: 'Yesterday', unread: 0, status: 'Active',
    messages: [
      { id: 'M3', sender: 'Agent', text: 'Dear Deepak, attached is the indicative pricing.', time: 'Yesterday 04:00 PM', status: 'Read' },
      { id: 'M4', sender: 'Customer', text: 'Received the pricing.', time: 'Yesterday 04:30 PM', status: 'Received' }
    ]
  }
];

export const whatsappCampaigns = [
  { id: 'WC-001', name: 'Festival Greetings - Deepavali', type: 'Holiday Greetings', audience: 'All Active Customers', sent: 1240, delivered: 1200, read: 980, replied: 120, failed: 40, optOut: 5, converted: 0, status: 'Completed' }
];

// ---------- Marketing Automation ----------
export const automations = [
  { id: 'MA-001', name: 'New Lead Welcome Journey', trigger: 'Lead Created', status: 'Active', lastRun: 'Today 10:00 AM', nextRun: 'Continuous', executions: 450, successRate: 98 },
  { id: 'MA-002', name: 'Quotation Follow-up', trigger: 'Quotation Sent', status: 'Active', lastRun: 'Today 11:30 AM', nextRun: 'Continuous', executions: 120, successRate: 100 }
];

// ---------- Approvals ----------
export const pendingApprovals = [
  { id: 'APP-001', type: 'Quotation', reference: 'QT-2026-08-000145', requestedBy: 'Arun Kumar', amount: 2500000, date: '2026-08-12', priority: 'High', currentLevel: 'Sales Manager', status: 'Pending' },
  { id: 'APP-002', type: 'Campaign', reference: 'Healthcare Webinar', requestedBy: 'Meera Iyer', amount: 50000, date: '2026-08-11', priority: 'Medium', currentLevel: 'CEO', status: 'Pending' }
];

// ---------- End of Volume 3 & 4 DATA ----------

// --- Local Storage Sync for Master Data ---
// This ensures any master data mutated during the session persists across browser reloads
if (typeof window !== 'undefined' && window.localStorage) {
  const masterMappings = {
    'industries': industries,
    'lead-sources': leadSources,
    'campaigns': campaigns,
    'activity-types': activityTypes,
    'lead-status': leadStatuses,
    'next-actions': nextActions,
    'priorities': priorities,
    'countries': countries,
    'states': states,
    'cities': cities,
  };

  Object.keys(masterMappings).forEach((key) => {
    try {
      const stored = localStorage.getItem(`crm_master_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const arr = masterMappings[key];
          arr.length = 0; // clear existing mock data
          parsed.forEach(item => arr.push(item)); // repopulate with persisted data
        }
      }
    } catch (e) { }
  });
}
