#!/bin/bash
# Complete database setup script for Ubuntu server
# Run this FIRST TIME on Ubuntu server to set up PostgreSQL

set -e

echo "=========================================="
echo "IPG Database Setup for Ubuntu Server"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}⚠️  This script should be run as root or with sudo${NC}"
    echo "Usage: sudo ./setup-ubuntu-database.sh"
    exit 1
fi

# Step 1: Install PostgreSQL
echo -e "${YELLOW}📦 Step 1: Installing PostgreSQL...${NC}"
apt update
apt install -y postgresql postgresql-contrib

echo -e "${GREEN}✅ PostgreSQL installed${NC}"
echo ""

# Step 2: Start PostgreSQL service
echo -e "${YELLOW}🚀 Step 2: Starting PostgreSQL service...${NC}"
systemctl start postgresql
systemctl enable postgresql
systemctl status postgresql --no-pager

echo -e "${GREEN}✅ PostgreSQL service started${NC}"
echo ""

# Step 3: Create database user
echo -e "${YELLOW}👤 Step 3: Creating database user...${NC}"
echo "Please enter details for the database user:"
read -p "Database user name [ipg_user]: " DB_USER
DB_USER=${DB_USER:-ipg_user}

read -sp "Database password: " DB_PASSWORD
echo ""

if [ -z "${DB_PASSWORD}" ]; then
    echo -e "${RED}❌ Password cannot be empty${NC}"
    exit 1
fi

# Create user and database
sudo -u postgres psql <<EOF
-- Create user
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- Create database
CREATE DATABASE ipg_production OWNER ${DB_USER};

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ipg_production TO ${DB_USER};

-- Connect to database and set up schema
\c ipg_production

-- Create schema
CREATE SCHEMA IF NOT EXISTS ipg;

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA ipg TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ipg TO ${DB_USER};
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ipg TO ${DB_USER};

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg GRANT ALL PRIVILEGES ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA ipg GRANT ALL PRIVILEGES ON SEQUENCES TO ${DB_USER};

EOF

echo -e "${GREEN}✅ Database user and database created${NC}"
echo ""

# Step 4: Configure PostgreSQL for remote access (if needed)
echo -e "${YELLOW}🔧 Step 4: Configuring PostgreSQL...${NC}"

PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"

# Backup original configs
cp ${PG_CONF} ${PG_CONF}.backup
cp ${PG_HBA} ${PG_HBA}.backup

# Allow local connections
if ! grep -q "host    ipg_production    ${DB_USER}    127.0.0.1/32    md5" ${PG_HBA}; then
    echo "host    ipg_production    ${DB_USER}    127.0.0.1/32    md5" >> ${PG_HBA}
fi

# Restart PostgreSQL
systemctl restart postgresql

echo -e "${GREEN}✅ PostgreSQL configured${NC}"
echo ""

# Step 5: Test connection
echo -e "${YELLOW}🧪 Step 5: Testing connection...${NC}"
PGPASSWORD=${DB_PASSWORD} psql -h localhost -U ${DB_USER} -d ipg_production -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connection test successful${NC}"
else
    echo -e "${RED}❌ Connection test failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ DATABASE SETUP COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Database details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: ipg_production"
echo "  User: ${DB_USER}"
echo "  Schema: ipg"
echo ""
echo "Add these to your server/.env file:"
echo "  PGHOST=localhost"
echo "  PGPORT=5432"
echo "  PGUSER=${DB_USER}"
echo "  PGPASSWORD=${DB_PASSWORD}"
echo "  PGDATABASE=ipg_production"
echo ""
echo "Next steps:"
echo "  1. Apply schema: node scripts/apply-schema.js"
echo "  2. Import data (if any): ./scripts/import-database.sh backup.sql.gz"
echo ""
