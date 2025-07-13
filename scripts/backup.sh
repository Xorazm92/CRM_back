#!/bin/bash

# CRM System Backup Script
# Usage: ./scripts/backup.sh [type]
# Types: full, db, files
# Example: ./scripts/backup.sh full

set -e

# Configuration
BACKUP_TYPE=${1:-full}
BACKUP_DIR="/opt/backups"
RETENTION_DAYS=30
S3_BUCKET=${BACKUP_S3_BUCKET:-""}
LOG_FILE="/var/log/backup.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

# Create backup directory
create_backup_dir() {
    sudo mkdir -p $BACKUP_DIR
    sudo chown $(whoami):$(whoami) $BACKUP_DIR
}

# Database backup
backup_database() {
    log "Starting database backup..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DB_BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
    
    # Create database dump
    docker-compose exec -T postgres pg_dump -U postgres -h localhost crm_production > $DB_BACKUP_FILE
    
    # Compress the backup
    gzip $DB_BACKUP_FILE
    DB_BACKUP_FILE="${DB_BACKUP_FILE}.gz"
    
    log "Database backup created: $DB_BACKUP_FILE"
    echo $DB_BACKUP_FILE
}

# Files backup
backup_files() {
    log "Starting files backup..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    FILES_BACKUP_FILE="${BACKUP_DIR}/files_backup_${TIMESTAMP}.tar.gz"
    
    # Backup uploaded files
    docker run --rm \
        -v crm-uploads:/data \
        -v $BACKUP_DIR:/backup \
        alpine tar czf /backup/files_backup_${TIMESTAMP}.tar.gz -C /data .
    
    log "Files backup created: $FILES_BACKUP_FILE"
    echo $FILES_BACKUP_FILE
}

# Configuration backup
backup_config() {
    log "Starting configuration backup..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    CONFIG_BACKUP_FILE="${BACKUP_DIR}/config_backup_${TIMESTAMP}.tar.gz"
    
    # Backup configuration files
    tar czf $CONFIG_BACKUP_FILE \
        .env.production \
        docker-compose.yml \
        nginx.conf \
        prisma/schema.prisma \
        scripts/ \
        monitoring/ 2>/dev/null || true
    
    log "Configuration backup created: $CONFIG_BACKUP_FILE"
    echo $CONFIG_BACKUP_FILE
}

# Upload to S3
upload_to_s3() {
    local file=$1
    
    if [[ -n "$S3_BUCKET" ]]; then
        log "Uploading $file to S3..."
        
        if command -v aws &> /dev/null; then
            aws s3 cp $file s3://$S3_BUCKET/backups/$(basename $file)
            log "Upload to S3 completed"
        else
            warning "AWS CLI not found, skipping S3 upload"
        fi
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    log "Cleanup completed"
}

# Full backup
full_backup() {
    log "=== Starting Full Backup ==="
    
    create_backup_dir
    
    # Backup database
    DB_FILE=$(backup_database)
    upload_to_s3 $DB_FILE
    
    # Backup files
    FILES_FILE=$(backup_files)
    upload_to_s3 $FILES_FILE
    
    # Backup configuration
    CONFIG_FILE=$(backup_config)
    upload_to_s3 $CONFIG_FILE
    
    # Cleanup
    cleanup_old_backups
    
    log "=== Full Backup Completed ==="
}

# Database only backup
db_backup() {
    log "=== Starting Database Backup ==="
    
    create_backup_dir
    DB_FILE=$(backup_database)
    upload_to_s3 $DB_FILE
    cleanup_old_backups
    
    log "=== Database Backup Completed ==="
}

# Files only backup
files_backup() {
    log "=== Starting Files Backup ==="
    
    create_backup_dir
    FILES_FILE=$(backup_files)
    upload_to_s3 $FILES_FILE
    cleanup_old_backups
    
    log "=== Files Backup Completed ==="
}

# Restore function
restore_backup() {
    local backup_file=$1
    
    if [[ -z "$backup_file" ]]; then
        error "Backup file not specified"
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
    fi
    
    log "=== Starting Restore from $backup_file ==="
    
    # Stop services
    docker-compose down
    
    # Restore database
    if [[ $backup_file == *.sql.gz ]]; then
        log "Restoring database..."
        gunzip -c $backup_file | docker-compose exec -T postgres psql -U postgres -d crm_production
    fi
    
    # Start services
    docker-compose up -d
    
    log "=== Restore Completed ==="
}

# Main execution
case "$BACKUP_TYPE" in
    "full")
        full_backup
        ;;
    "db"|"database")
        db_backup
        ;;
    "files")
        files_backup
        ;;
    "restore")
        restore_backup $2
        ;;
    *)
        echo "Usage: $0 {full|db|files|restore}"
        echo "  full     - Complete backup (database + files + config)"
        echo "  db       - Database backup only"
        echo "  files    - Files backup only"
        echo "  restore  - Restore from backup file"
        exit 1
        ;;
esac
