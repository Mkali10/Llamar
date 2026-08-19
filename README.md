# Llamar

Compliance-first, white-label, multi-tenant contact-center platform for India.

This foundation provides a FastAPI control plane, PostgreSQL 16 development stack,
tenant-scoped compliance evaluation, tests, and recovery documentation. Compliance
decisions fail closed: incomplete requests are denied and complete requests remain
in review until provider and policy checks are implemented.

```bash
cp .env.example .env
docker compose up --build -d
curl http://localhost:8080/health/live
```

See `docs/INSTALLATION.md` and `docs/BACKUP_RESTORE.md`.
