#!/bin/bash

# CRM System Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="crm-system"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if environment file exists
    if [[ ! -f ".env.${ENVIRONMENT}" ]]; then
        error "Environment file .env.${ENVIRONMENT} not found"
    fi
    
    log "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    # Create backup directory if it doesn't exist
    sudo mkdir -p $BACKUP_DIR
    
    # Backup database
    BACKUP_FILE="${BACKUP_DIR}/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T postgres pg_dump -U postgres crm_production > $BACKUP_FILE
    
    # Backup uploaded files
    UPLOADS_BACKUP="${BACKUP_DIR}/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    docker run --rm -v crm-uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
    
    log "Backup created: $BACKUP_FILE and $UPLOADS_BACKUP"
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    docker-compose -f docker-compose.yml pull
    log "Images pulled successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    docker-compose exec -T nest-api npx prisma migrate deploy
    log "Migrations completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check API health
    if curl -f http://localhost:3030/api/v1/health > /dev/null 2>&1; then
        log "Health check passed"
    else
        error "Health check failed"
    fi
}

# Deploy application
deploy() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    # Copy environment file
    cp .env.$ENVIRONMENT .env
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose down
    
    # Pull latest images
    pull_images
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Run migrations
    run_migrations
    
    # Health check
    health_check
    
    # Clean up old images
    log "Cleaning up old Docker images..."
    docker image prune -f
    
    log "Deployment completed successfully!"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup (implement based on your backup strategy)
    warning "Manual rollback required - restore from backup if needed"
    
    log "Rollback completed"
}

# Main execution
main() {
    log "=== CRM System Deployment Started ==="
    
    check_root
    check_prerequisites
    
    # Create backup before deployment
    create_backup
    
    # Deploy
    deploy
    
    log "=== Deployment Completed Successfully ==="
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy"|"production"|"staging")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health}"
        echo "  deploy     - Deploy the application"
        echo "  rollback   - Rollback to previous version"
        echo "  health     - Check application health"
        exit 1
        ;;
esac
