import os
import re

enum_names = ["UserRole", "ComplaintType", "ComplaintStatus", "WasteType", "TruckStatus", 
              "CollectionStatus", "RewardLevel", "NotificationType", "RouteStatus", 
              "MediaType", "ShiftType"]

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            new_content = content
            for enum in enum_names:
                # Find if enum is imported from @prisma/client
                match = re.search(r'import\s+\{([^}]*)\b' + enum + r'\b([^}]*)\}\s+from\s+[\'"]@prisma/client[\'"]', new_content)
                if match:
                    # Calculate relative path to src/common/prisma-enums
                    depth = filepath.count(os.sep) - 1
                    rel_path = '../' * depth + 'common/prisma-enums' if depth > 0 else './common/prisma-enums'
                    rel_path = rel_path.replace('\\', '/')
                    
                    # Remove enum from original import
                    new_import = re.sub(r'\b' + enum + r'\b,?\s*', '', match.group(0))
                    # Clean up empty import {}
                    if re.search(r'import\s+\{\s*\}\s+from\s+[\'"]@prisma/client[\'"]', new_import):
                        new_content = new_content.replace(match.group(0), f"import {{ {enum} }} from '{rel_path}';")
                    else:
                        new_content = new_content.replace(match.group(0), f"{new_import}\nimport {{ {enum} }} from '{rel_path}';")
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
