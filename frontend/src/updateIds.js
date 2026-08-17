const fs = require('fs');
let content = fs.readFileSync('d:/CRM/frontend/src/data/mockData.js', 'utf8');

const replacements = {
  'CMP-1001': 'CMP-001', 'CMP-1002': 'CMP-002', 'CMP-1003': 'CMP-003', 'CMP-1004': 'CMP-004', 'CMP-1005': 'CMP-005', 'CMP-1006': 'CMP-006', 'CMP-1007': 'CMP-007', 'CMP-1008': 'CMP-008', 'CMP-1009': 'CMP-009', 'CMP-1010': 'CMP-010',
  'CNT-2001': 'CNT-001', 'CNT-2002': 'CNT-002', 'CNT-2003': 'CNT-003', 'CNT-2004': 'CNT-004', 'CNT-2005': 'CNT-005', 'CNT-2006': 'CNT-006', 'CNT-2007': 'CNT-007', 'CNT-2008': 'CNT-008', 'CNT-2009': 'CNT-009', 'CNT-2010': 'CNT-010', 'CNT-2011': 'CNT-011', 'CNT-2012': 'CNT-012',
  'LEAD-000124': 'LEAD-001', 'LEAD-000125': 'LEAD-002', 'LEAD-000126': 'LEAD-003', 'LEAD-000127': 'LEAD-004', 'LEAD-000128': 'LEAD-005', 'LEAD-000129': 'LEAD-006', 'LEAD-000130': 'LEAD-007', 'LEAD-000131': 'LEAD-008', 'LEAD-000132': 'LEAD-009', 'LEAD-000133': 'LEAD-010',
  'OPP-3001': 'OPP-001', 'OPP-3002': 'OPP-002', 'OPP-3003': 'OPP-003', 'OPP-3004': 'OPP-004', 'OPP-3005': 'OPP-005', 'OPP-3006': 'OPP-006', 'OPP-3007': 'OPP-007', 'OPP-3008': 'OPP-008',
  'ACT-9001': 'ACT-001', 'ACT-9002': 'ACT-002', 'ACT-9003': 'ACT-003', 'ACT-9004': 'ACT-004', 'ACT-9005': 'ACT-005', 'ACT-9006': 'ACT-006', 'ACT-9007': 'ACT-007', 'ACT-9008': 'ACT-008', 'ACT-9009': 'ACT-009', 'ACT-9010': 'ACT-010', 'ACT-9011': 'ACT-011', 'ACT-9012': 'ACT-012',
  'FU-4001': 'FU-001', 'FU-4002': 'FU-002', 'FU-4003': 'FU-003', 'FU-4004': 'FU-004', 'FU-4005': 'FU-005', 'FU-4006': 'FU-006', 'FU-4007': 'FU-007', 'FU-4008': 'FU-008', 'FU-4009': 'FU-009', 'FU-4010': 'FU-010'
};

for (const [oldVal, newVal] of Object.entries(replacements)) {
  content = content.split(oldVal).join(newVal);
}

fs.writeFileSync('d:/CRM/frontend/src/data/mockData.js', content, 'utf8');
console.log('mockData updated successfully!');
