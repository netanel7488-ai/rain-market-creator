# 🚀 Rain Market Creator - Deployment Guide

## כרגע: שרת זמני (localhost)

השרת רץ על **http://localhost:3000** בשביל פיתוח ובדיקות.

---

## אופציות ל-Production Deployment

### 1. VPS (המלצה ראשונית)

**Providers:**
- DigitalOcean ($5-10/mo)
- Linode ($5-10/mo)
- Vultr ($5-10/mo)
- AWS Lightsail ($3.50-10/mo)

**Setup:**
```bash
# SSH to server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone/upload project
git clone <your-repo> rain-market-creator
cd rain-market-creator

# Install dependencies
npm install

# Start with PM2
pm2 start server.js --name rain-market-creator
pm2 save
pm2 startup

# Setup nginx reverse proxy
sudo apt install nginx
# Configure nginx to proxy port 80 → 3000
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL (Certbot):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 2. Render.com (המלצה קלה)

**יתרונות:**
- Free tier זמין
- Auto SSL
- Git deploy
- Zero config

**Steps:**
1. Push לGitHub
2. Connect repo ב-Render
3. הגדר build command: `npm install`
4. הגדר start command: `npm start`
5. Deploy!

**render.yaml:**
```yaml
services:
  - type: web
    name: rain-market-creator
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

---

### 3. Vercel (Frontend only)

אם תרצה להפריד frontend/backend:

**Frontend:** Deploy ל-Vercel (static HTML)
**Backend:** Deploy ל-Render/Railway/Fly.io

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd public
vercel --prod
```

---

### 4. Railway.app

**יתרונות:**
- $5 free credit
- Simple deploy
- Auto SSL

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init project
railway init

# Deploy
railway up
```

---

### 5. Fly.io

**יתרונות:**
- Free tier
- Global edge network
- Dockerfile support

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch
flyctl launch

# Deploy
flyctl deploy
```

**fly.toml:**
```toml
app = "rain-market-creator"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

---

## Environment Variables

צריך להגדיר במערכת production:

```bash
# .env
NODE_ENV=production
PORT=3000
GRAPH_API_KEY=your_graph_key    # Optional
WS_RPC_URL=wss://arb1.arbitrum.io/rpc  # Optional
```

---

## Domain Setup

**אחרי deployment:**

1. רכוש דומיין (Namecheap, GoDaddy, Cloudflare)
2. הגדר DNS:
   ```
   A     @    <server-ip>
   CNAME www  @
   ```
3. חכה 1-24 שעות לpropagation
4. הגדר SSL (Certbot / Let's Encrypt)

---

## Monitoring

**אופציות:**
- PM2 logs: `pm2 logs`
- PM2 status: `pm2 status`
- Sentry.io - error tracking
- UptimeRobot - uptime monitoring
- LogTail - log aggregation

---

## Performance

**Optimization:**
- Gzip compression (nginx/express)
- CDN for static files (Cloudflare)
- Rate limiting (express-rate-limit)
- Caching (Redis optional)

**express optimizations:**
```javascript
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // limit each IP
});
app.use('/api/', limiter);
```

---

## Security

**Checklist:**
- ✅ Environment variables (not hardcoded)
- ✅ CORS configured properly
- ✅ Rate limiting on API routes
- ✅ Helmet.js for security headers
- ✅ HTTPS only (redirect HTTP → HTTPS)
- ✅ No private keys in server code
- ✅ Input validation
- ✅ SQL injection prevention (N/A - no DB)

---

## Backup & Recovery

**קבצים חשובים:**
- `server.js`
- `public/index.html`
- `package.json`
- `.env` (keep secure backup)

**Git backup:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo>
git push -u origin main
```

---

## Cost Estimates

| Option | Monthly Cost | Setup Time |
|--------|-------------|------------|
| VPS | $5-10 | 30-60 min |
| Render | Free-$7 | 5 min |
| Railway | Free-$5 | 5 min |
| Fly.io | Free-$5 | 10 min |
| Vercel (frontend only) | Free | 2 min |

---

## המלצה

**לפיתוח:** localhost (מה שיש עכשיו)  
**לבדיקות:** Render.com free tier  
**לproduction:** VPS + nginx + PM2 (שליטה מלאה)

---

**זמן ל-deployment: 5-60 דקות תלוי באופציה שתבחר!** 🚀
