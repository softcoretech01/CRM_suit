import re

with open('d:/CRM/frontend/src/pages/masters/MasterPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"\{\s*key:\s*'code',\s*label:\s*'Code',\s*className:\s*'mono',\s*sortable:\s*true,\s*width:\s*'[0-9]+px'\s*\}"
replacement = "{ key: 'sno', label: 'S.No', width: '70px', render: (_, idx) => <span className=\"text-secondary-c\">{idx}</span> }"

new_content = re.sub(pattern, replacement, content)

with open('d:/CRM/frontend/src/pages/masters/MasterPage.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Replaced S.No successfully!")
