#!/bin/bash
# Upload 2026 candidate documents to server and create DB records
# Usage: bash scripts/upload-2026-docs.sh

SSH_KEY="$HOME/.ssh/seekof_deploy"
SERVER="root@72.62.230.223"
REMOTE_PATH="/var/www/edwartens-uk/uploads/documents"
BASE_DIR="$HOME/Applications/EDWARTENS UK/2026"
DB_CMD="cd /var/www/edwartens-uk && PGPASSWORD=\$(grep DATABASE_URL .env | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/') psql -h localhost -U \$(grep DATABASE_URL .env | sed 's/.*:\/\/\([^:]*\):.*/\1/') -d edwartens_uk -t -A"

# Mapping: folder name -> student ID
declare -A STUDENT_MAP
STUDENT_MAP["Jan/Daniel Olaseinde"]="cmnbewnpx00hz110b4hrakzb4"
STUDENT_MAP["Jan/Jenis Vinoth Kumar"]="cmnbewnpb00hh110bvwdxf9yt"
STUDENT_MAP["Jan/Jijo"]="cmnbewnpn00hq110bre9j9eu3"
STUDENT_MAP["Jan/Krishna kumar kasinathadurai"]="cmnbewnp400h8110bfoa4tnaa"
STUDENT_MAP["Jan/Naveen Telson Puthezhath"]="cmnbewnp900he110b9iqjb654"
STUDENT_MAP["Feb/Hemanth"]="cmnbewnqb00ib110bkcd488ft"
STUDENT_MAP["Feb/Mullaivendan Nagarajan"]="cmnbewnq000i2110blg522bj0"
STUDENT_MAP["March/Abin Antony"]="cmnbewnqq00in110b6cqryzmd"
STUDENT_MAP["March/Aron"]="cmnbewnr600iw110bgpg7nm1e"
STUDENT_MAP["March/Jishnu Kaliyathan Moorkoth"]="cmnbewnqj00ih110b6r2ga0q5"
STUDENT_MAP["March/Junemol Devassykutty"]="cmnbewnqt00iq110belnk80wh"
STUDENT_MAP["March/Neeraj Lal Alakkal Mohan"]="cmnbewnqx00it110b0ltviffx"
STUDENT_MAP["March/Rafeek Rasool"]="cmnbewnqm00ik110b0aipacg1"

TOTAL=0
UPLOADED=0

for folder_key in "${!STUDENT_MAP[@]}"; do
  STUDENT_ID="${STUDENT_MAP[$folder_key]}"
  FOLDER="$BASE_DIR/$folder_key"

  if [ ! -d "$FOLDER" ]; then
    echo "SKIP: Folder not found: $FOLDER"
    continue
  fi

  echo ""
  echo "=== Processing: $folder_key (Student: $STUDENT_ID) ==="

  find "$FOLDER" -type f | while read filepath; do
    filename=$(basename "$filepath")
    # Determine doc type based on filename
    DOC_TYPE="OTHER"
    lower_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]')

    if echo "$lower_name" | grep -qiE "cv|resume"; then
      DOC_TYPE="CV"
    elif echo "$lower_name" | grep -qiE "certificate|cert|degree|qualification|marksheet|education"; then
      DOC_TYPE="QUALIFICATION"
    elif echo "$lower_name" | grep -qiE "brp|passport|visa|share.code|evisa|pic|photo|id"; then
      DOC_TYPE="ID_PROOF"
    elif echo "$lower_name" | grep -qiE "terms|condition|payment|receipt"; then
      DOC_TYPE="OTHER"
    fi

    # Generate unique filename
    EXT="${filename##*.}"
    UNIQUE_NAME="${STUDENT_ID}-2026-$(echo "$filename" | tr ' ' '-' | tr -cd '[:alnum:]-_.')"
    REMOTE_FILE="$REMOTE_PATH/$UNIQUE_NAME"

    # Upload file
    scp -i "$SSH_KEY" -q "$filepath" "$SERVER:$REMOTE_FILE" 2>/dev/null

    if [ $? -eq 0 ]; then
      # Create Document record in DB
      ESCAPED_NAME=$(echo "$filename" | sed "s/'/''/g")
      FILE_PATH="/uploads/documents/$UNIQUE_NAME"

      ssh -i "$SSH_KEY" "$SERVER" "$DB_CMD -c \"
        INSERT INTO \\\"Document\\\" (id, \\\"studentId\\\", name, type, \\\"filePath\\\", status, \\\"uploadedAt\\\")
        VALUES (
          'doc_' || substr(md5(random()::text), 1, 24),
          '$STUDENT_ID',
          '$ESCAPED_NAME',
          '$DOC_TYPE',
          '$FILE_PATH',
          'UPLOADED',
          NOW()
        )
        ON CONFLICT DO NOTHING;
      \"" 2>/dev/null

      echo "  ✅ $filename ($DOC_TYPE)"
      UPLOADED=$((UPLOADED + 1))
    else
      echo "  ❌ Failed to upload: $filename"
    fi

    TOTAL=$((TOTAL + 1))
  done
done

echo ""
echo "=== DONE ==="
echo "Total files processed: $TOTAL"
