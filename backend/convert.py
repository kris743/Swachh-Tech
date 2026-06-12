import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Change provider
content = re.sub(r'provider\s*=\s*"postgresql"', 'provider = "sqlite"\n  url      = "file:./dev.db"', content)

# Remove enums
content = re.sub(r'enum \w+ \{[^}]+\}', '', content)

# Replace String[] with String
content = re.sub(r'String\[\]', 'String', content)

# Replace field types
enums = ["UserRole", "ComplaintType", "ComplaintStatus", "WasteType", "TruckStatus", 
         "CollectionStatus", "RewardLevel", "NotificationType", "RouteStatus", 
         "MediaType", "ShiftType"]

for enum in enums:
    content = re.sub(rf'\b{enum}\b', 'String', content)

# Fix defaults for enums (add quotes)
# e.g., @default(BRONZE) -> @default("BRONZE")
defaults = ["CITIZEN", "WORKER", "DRIVER", "GREEN_CHAMPION", "RECYCLER", "ADMIN",
            "GARBAGE_DUMP", "OVERFLOWING_BIN", "ILLEGAL_DUMPING", "MISSED_COLLECTION", "BURNING_WASTE", "OTHER",
            "PENDING", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED",
            "DRY", "WET", "HAZARDOUS", "E_WASTE", "MIXED",
            "ACTIVE", "INACTIVE", "MAINTENANCE", "EN_ROUTE",
            "COLLECTED", "SKIPPED", "PARTIAL",
            "BRONZE", "SILVER", "GOLD", "PLATINUM",
            "EMAIL", "SMS", "PUSH", "IN_APP",
            "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED",
            "IMAGE", "VIDEO",
            "MORNING", "AFTERNOON", "NIGHT"]

for d in defaults:
    content = re.sub(rf'@default\({d}\)', f'@default("{d}")', content)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)
