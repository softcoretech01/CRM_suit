import os
import subprocess
from datetime import datetime

DB_HOST = "100.86.181.18"
DB_PORT = "3325"
DB_USER = "root"
DB_PASSWORD = "Cr3#2026"
DATABASES = ["Admin_crm", "Masters_crm", "CRM"]

BACKUP_DIR = r"d:\CRM\backup"

def backup_databases():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print(f"Starting backup at {timestamp}...")
    
    for db in DATABASES:
        backup_file = os.path.join(BACKUP_DIR, f"{db}_backup_{timestamp}.sql")
        
        # Build mysqldump command
        cmd = [
            "mysqldump",
            f"-h{DB_HOST}",
            f"-P{DB_PORT}",
            f"-u{DB_USER}",
            f"-p{DB_PASSWORD}",
            "--routines",  # Include stored procedures
            "--triggers",
            "--events",
            db
        ]
        
        print(f"Backing up {db} to {backup_file}...")
        try:
            with open(backup_file, "w", encoding="utf-8") as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
                
            if result.returncode == 0:
                print(f"[SUCCESS] Successfully backed up {db}")
            else:
                print(f"[FAILED] Failed to back up {db}. Error:")
                print(result.stderr)
        except Exception as e:
            print(f"[EXCEPTION] Exception during backup of {db}: {e}")

if __name__ == "__main__":
    backup_databases()
