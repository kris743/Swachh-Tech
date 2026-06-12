import re

with open('prisma.config.ts', 'r') as f:
    config = f.read()

config = re.sub(r'migrate: \{', 'datasource: { url: "file:./dev.db" },\n  migrate: {', config)

with open('prisma.config.ts', 'w') as f:
    f.write(config)

