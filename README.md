# Llamar

Compliance-first, white-label, multi-tenant contact-center platform for India.

This foundation provides a Node.js/TypeScript control plane, React web application and PostgreSQL 16 stack,
tenant-scoped compliance evaluation, tests, and recovery documentation. Compliance
decisions fail closed: incomplete requests are denied and complete requests remain
in review until provider and policy checks are implemented.

```bash
cp .env.example .env
# Replace all example secrets, then:
make install
make smoke
```

Web dashboard: `http://SERVER_IP:18080` · API docs: `http://127.0.0.1:18443/docs` (loopback by default). See `docs/FIREWALL_PORTS.md` before exposing services.

See `docs/INSTALLATION.md`, `docs/DEPLOYMENT.md`, `docs/ARCHITECTURE.md`, and
`docs/BACKUP_RESTORE.md`.
