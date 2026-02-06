#!/bin/bash
# Import database script for Ubuntu server

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Backup file not specified"
    echo "Usage: ./import-database.sh <backup_file.sql.gz>"
    echo "Example: ./import-database.sh backups/ipg_backup_20260202.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

echo "=========================================="
echo "IPG Database Import Script"
echo "=========================================="
echo "Backup file: ${BACKUP_FILE}"
echo "Target database: ${PGDATABASE}"
echo "Host: ${PGHOST}"
echo "Port: ${PGPORT}"
echo "User: ${PGUSER}"
echo "=========================================="
echo ""

# Check if database exists
echo "🔍 Checking if database exists..."
DB_EXISTS=$(PGPASSWORD=${PGPASSWORD} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -lqt | cut -d \| -f 1 | grep -w ${PGDATABASE} | wc -l)

if [ ${DB_EXISTS} -eq 0 ]; then
    echo "📦 Creating database ${PGDATABASE}..."
    PGPASSWORD=${PGPASSWORD} createdb -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} ${PGDATABASE}
    echo "✅ Database created"
else
    echo "⚠️  Database ${PGDATABASE} already exists"
    read -p "Do you want to drop and recreate it? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "🗑️  Dropping database..."
        PGPASSWORD=${PGPASSWORD} dropdb -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} ${PGDATABASE}
        echo "📦 Creating database..."
        PGPASSWORD=${PGPASSWORD} createdb -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} ${PGDATABASE}
        echo "✅ Database recreated"
    else
        echo "ℹ️  Using existing database"
    fi
fi

# Decompress if needed
if [[ ${BACKUP_FILE} == *.gz ]]; then
    echo "🗜️  Decompressing backup..."
    TMP_FILE="/tmp/ipg_restore_tmp.sql"
    gunzip -c ${BACKUP_FILE} > ${TMP_FILE}
    RESTORE_FILE=${TMP_FILE}
else
    RESTORE_FILE=${BACKUP_FILE}
fi

# Import database
echo "📥 Importing database..."
PGPASSWORD=${PGPASSWORD} psql \
    -h ${PGHOST} \
    -p ${PGPORT} \
    -U ${PGUSER} \
    -d ${PGDATABASE} \
    -f ${RESTORE_FILE} \
    -v ON_ERROR_STOP=1

# Cleanup temp file
if [ ! -z "${TMP_FILE}" ] && [ -f "${TMP_FILE}" ]; then
    rm -f ${TMP_FILE}
fi

echo ""
echo "=========================================="
echo "✅ DATABASE IMPORT COMPLETE!"
echo "=========================================="
echo ""

# Verify import
echo "🔍 Verifying import..."
TABLE_COUNT=$(PGPASSWORD=${PGPASSWORD} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ipg';")
echo "   Tables in schema 'ipg': ${TABLE_COUNT}"

USER_COUNT=$(PGPASSWORD=${PGPASSWORD} psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} -t -c "SELECT COUNT(*) FROM ipg.users;" 2>/dev/null || echo "0")
echo "   Users: ${USER_COUNT}"

echo ""
echo "✅ Import verification complete!"
echo ""
