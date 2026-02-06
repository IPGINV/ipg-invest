#!/bin/bash
# Export database script for migration to Ubuntu server

set -e

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backups"
BACKUP_FILE="${BACKUP_DIR}/ipg_backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

echo "=========================================="
echo "IPG Database Export Script"
echo "=========================================="
echo "Database: ${PGDATABASE}"
echo "Host: ${PGHOST}"
echo "Port: ${PGPORT}"
echo "User: ${PGUSER}"
echo "Timestamp: ${TIMESTAMP}"
echo "=========================================="

# Export schema
echo "📦 Exporting database schema..."
PGPASSWORD=${PGPASSWORD} pg_dump \
    -h ${PGHOST} \
    -p ${PGPORT} \
    -U ${PGUSER} \
    -d ${PGDATABASE} \
    --schema=ipg \
    --schema-only \
    -f "${BACKUP_DIR}/schema_${TIMESTAMP}.sql"

echo "✅ Schema exported: schema_${TIMESTAMP}.sql"

# Export data only
echo "📦 Exporting database data..."
PGPASSWORD=${PGPASSWORD} pg_dump \
    -h ${PGHOST} \
    -p ${PGPORT} \
    -U ${PGUSER} \
    -d ${PGDATABASE} \
    --schema=ipg \
    --data-only \
    --column-inserts \
    -f "${BACKUP_DIR}/data_${TIMESTAMP}.sql"

echo "✅ Data exported: data_${TIMESTAMP}.sql"

# Export full database (schema + data)
echo "📦 Exporting full database..."
PGPASSWORD=${PGPASSWORD} pg_dump \
    -h ${PGHOST} \
    -p ${PGPORT} \
    -U ${PGUSER} \
    -d ${PGDATABASE} \
    --schema=ipg \
    -f "${BACKUP_FILE}"

echo "✅ Full backup exported: $(basename ${BACKUP_FILE})"

# Compress backup
echo "🗜️  Compressing backup..."
gzip -c ${BACKUP_FILE} > ${BACKUP_FILE_COMPRESSED}
echo "✅ Compressed: $(basename ${BACKUP_FILE_COMPRESSED})"

# Calculate sizes
SCHEMA_SIZE=$(du -h "${BACKUP_DIR}/schema_${TIMESTAMP}.sql" | cut -f1)
DATA_SIZE=$(du -h "${BACKUP_DIR}/data_${TIMESTAMP}.sql" | cut -f1)
FULL_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
COMPRESSED_SIZE=$(du -h "${BACKUP_FILE_COMPRESSED}" | cut -f1)

echo ""
echo "=========================================="
echo "📊 BACKUP SUMMARY"
echo "=========================================="
echo "Schema only:      ${SCHEMA_SIZE}"
echo "Data only:        ${DATA_SIZE}"
echo "Full backup:      ${FULL_SIZE}"
echo "Compressed:       ${COMPRESSED_SIZE}"
echo "=========================================="
echo ""
echo "📁 Backup location: ${BACKUP_DIR}/"
echo ""
echo "✅ Database export complete!"
echo ""
echo "📤 To transfer to Ubuntu server:"
echo "   scp ${BACKUP_FILE_COMPRESSED} user@server:/path/to/backups/"
echo ""
