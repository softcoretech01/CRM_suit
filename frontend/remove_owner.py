import re

with open('src/data/mockData.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"owner: '[^']+', ", "", content)
content = re.sub(r"owner: '[^']+'(,?)", "", content)

with open('src/data/mockData.js', 'w', encoding='utf-8') as f:
    f.write(content)
