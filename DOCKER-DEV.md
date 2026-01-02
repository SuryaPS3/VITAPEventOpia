# Docker Development Setup

## Quick Start (Development)

```bash
# Start development environment with hot reload
docker compose -f docker-compose.dev.yml up

# Or run in background
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop
docker compose -f docker-compose.dev.yml down
```

**Access:**
- Frontend: http://localhost (via nginx) or http://localhost:5173 (direct)
- Backend: http://localhost:3000
- API: http://localhost/api

**Hot Reload:**
- ✅ Edit `backend/**/*.js` → nodemon auto-restarts
- ✅ Edit `Frontend/src/**` → Vite HMR instantly updates browser
- ❌ No image rebuilds needed

**Install Dependencies:**
```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend npm install <package>

# Frontend
docker compose -f docker-compose.dev.yml exec frontend npm install <package>
```

## Production Build

```bash
# Build production images
docker compose build

# Run production
docker compose up -d

# Stop
docker compose down
```

## Architecture

### Development (docker-compose.dev.yml)
- **No COPY** - Uses bind mounts (volumes)
- **Hot reload** - nodemon + Vite HMR
- **Fast** - No rebuilds on code changes
- **Clean host** - Only Docker installed

### Production (docker-compose.yml)
- **COPY source** - Immutable images
- **Optimized** - Multi-stage builds
- **Portable** - Can deploy anywhere

## Deployment Strategy

**Frontend → Vercel**
- Push to GitHub
- Vercel auto-deploys from `main` branch
- No Docker needed

**Backend → Render / Railway / Fly.io**
- Use production `Dockerfile` from `backend/`
- Set environment variables in platform
- Docker image deployed automatically

## Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Code Location | Volume mount | COPY in image |
| Rebuild on change | Never | Only on deploy |
| Node modules | Cached volume | In image |
| Hot reload | ✅ Yes | ❌ No |
| Image size | N/A (uses base) | Optimized |

## Troubleshooting

**Port conflicts:**
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5173
```

**Permission issues:**
```bash
# If you get permission denied
sudo chown -R $USER:$USER backend/node_modules Frontend/node_modules
```

**Node modules out of sync:**
```bash
# Rebuild node_modules volumes
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

**Database connection:**
- Update `backend/.env` with correct `DB_HOST` and credentials
- Restart: `docker compose -f docker-compose.dev.yml restart backend`