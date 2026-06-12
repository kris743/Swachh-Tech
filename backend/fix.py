import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Remove the url property
content = re.sub(r'url\s*=\s*"file:\./dev\.db"\n?', '', content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

with open('prisma.config.ts', 'r') as f:
    config = f.read()

config = re.sub(r'url:.*,', 'url: "file:./dev.db",', config)

with open('prisma.config.ts', 'w') as f:
    f.write(config)

