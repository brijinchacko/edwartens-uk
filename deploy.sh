#!/bin/bash
set -e

echo "=========================================="
echo "  EDWartens UK - Deployment Script"
echo "=========================================="

# Configuration
APP_DIR="/var/www/edwartens-uk"
APP_PORT=3006
APP_NAME="edwartens-uk"
DOMAIN="edwartens.co.uk"
REPO_URL="https://github.com/brijinchacko/edwartens-uk.git"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; }

# Step 1: Check prerequisites
echo ""
echo "Step 1: Checking prerequisites..."

if ! command -v node &> /dev/null; then
    warn "Node.js not found. Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    err "Node.js 18+ required. Current: $(node -v). Upgrading..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
log "Node.js $(node -v)"

if ! command -v pm2 &> /dev/null; then
    warn "PM2 not found. Installing..."
    npm install -g pm2
fi
log "PM2 installed"

# Step 2: Check PostgreSQL
echo ""
echo "Step 2: Checking PostgreSQL..."

if ! command -v psql &> /dev/null; then
    warn "PostgreSQL not found. Installing..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi
log "PostgreSQL available"

# Step 3: Create database (if not exists)
echo ""
echo "Step 3: Setting up database..."

DB_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='edwartens'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER edwartens WITH PASSWORD '${DB_PASSWORD}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='edwartens_uk'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE edwartens_uk OWNER edwartens;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE edwartens_uk TO edwartens;" 2>/dev/null || true
sudo -u postgres psql -d edwartens_uk -c "GRANT ALL ON SCHEMA public TO edwartens;" 2>/dev/null || true

# If DB already existed, update password
sudo -u postgres psql -c "ALTER USER edwartens WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || true

log "Database ready (user: edwartens, db: edwartens_uk)"

# Step 4: Clone/update repo
echo ""
echo "Step 4: Setting up application..."

mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -d ".git" ]; then
    log "Repo exists. Pulling latest..."
    git pull origin main
else
    log "Cloning repository..."
    git clone "$REPO_URL" .
fi

# Step 5: Create .env
echo ""
echo "Step 5: Configuring environment..."

NEXTAUTH_SECRET=$(openssl rand -base64 32)

cat > .env << ENVEOF
DATABASE_URL="postgresql://edwartens:${DB_PASSWORD}@localhost:5432/edwartens_uk"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://${DOMAIN}"
NEXT_PUBLIC_SITE_URL="https://${DOMAIN}"
NEXT_PUBLIC_GLOBAL_SITE_URL="https://edwartens.com"
STRIPE_SECRET_KEY="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"
STRIPE_PUBLISHABLE_KEY="pk_live_51OsWXhJfVFWEKRR5RQ5R2C7VEC6Ubj1KSbosnaTshz9CNdBdESbtpy8MyrijGFyHannAiMz20Z2j3NVUyB3n4Zrg00Jh0Q1vzt"
STRIPE_WEBHOOK_SECRET="whsec_15dE7HtHH6qMLgFxSBU4v7vojd0nUpVR"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51OsWXhJfVFWEKRR5RQ5R2C7VEC6Ubj1KSbosnaTshz9CNdBdESbtpy8MyrijGFyHannAiMz20Z2j3NVUyB3n4Zrg00Jh0Q1vzt"
NEXT_PUBLIC_BASE_URL="https://${DOMAIN}"
RESEND_API_KEY="re_placeholder"
RESEND_FROM_EMAIL="noreply@edwartens.co.uk"
UPLOAD_DIR="./uploads"
ENVEOF

log ".env configured"

# Step 6: Install dependencies
echo ""
echo "Step 6: Installing dependencies..."
npm install
log "Dependencies installed"

# Step 7: Build
echo ""
echo "Step 7: Building application..."
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build
log "Application built successfully"

# Step 8: Create uploads directory
mkdir -p uploads/documents
log "Upload directory created"

# Step 9: Start/restart with PM2
echo ""
echo "Step 8: Starting application with PM2..."

pm2 describe "$APP_NAME" > /dev/null 2>&1 && pm2 delete "$APP_NAME"
PORT=$APP_PORT pm2 start npm --name "$APP_NAME" -- start
pm2 save
log "Application running on port $APP_PORT"

# Step 10: Nginx configuration
echo ""
echo "Step 9: Configuring Nginx..."

if command -v nginx &> /dev/null; then
    # Check if config already exists
    if [ ! -f "/etc/nginx/sites-available/${DOMAIN}" ]; then
        cat > /etc/nginx/sites-available/${DOMAIN} << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF
        ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
        nginx -t && systemctl reload nginx
        log "Nginx configured for ${DOMAIN}"
    else
        warn "Nginx config already exists for ${DOMAIN}. Skipping."
    fi

    # SSL
    if command -v certbot &> /dev/null; then
        if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
            warn "Setting up SSL certificate..."
            certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email info@wartens.com || warn "SSL setup failed - you may need to run certbot manually"
        else
            log "SSL certificate already exists"
        fi
    else
        warn "Certbot not found. Install with: apt install certbot python3-certbot-nginx"
    fi
else
    warn "Nginx not installed. Install with: apt install nginx"
fi

# Done
echo ""
echo "=========================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "  App URL:    https://${DOMAIN}"
echo "  App Port:   ${APP_PORT}"
echo "  PM2 Name:   ${APP_NAME}"
echo "  DB User:    edwartens"
echo "  DB Name:    edwartens_uk"
echo ""
echo "  Login Credentials:"
echo "  Super Admin: jbc@wartens.com / Admin@2026!"
echo "  Admin:       admin@edwartens.co.uk / admin2026!"
echo "  Sales Lead:  staff@edwartens.co.uk / staff2026!"
echo "  Counsellor:  counsellor@edwartens.co.uk / counsellor2026!"
echo "  Trainer:     trainer@edwartens.co.uk / trainer2026!"
echo "  Student:     demo@edwartens.co.uk / demo2026!"
echo ""
echo "  Useful commands:"
echo "  pm2 logs ${APP_NAME}    # View logs"
echo "  pm2 restart ${APP_NAME} # Restart app"
echo "  pm2 status              # Check all apps"
echo ""
echo "  IMPORTANT: Update Stripe webhook URL to:"
echo "  https://${DOMAIN}/api/webhooks/stripe"
echo "=========================================="
