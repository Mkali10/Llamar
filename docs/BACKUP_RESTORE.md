# Backup and restore

Recovery goal: fresh OS → clone Git → download/decrypt backup → restore → validate.

Back up PostgreSQL and migration state, recordings/prompts/imports/approval documents,
encrypted deployment secrets, tenant branding/domains, FreeSWITCH configuration, and
a version/checksum manifest. Never put plaintext secrets or compliance documents in Git.

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump --format=custom --no-owner --no-acl \
  -U "$POSTGRES_USER" "$POSTGRES_DB" > backups/llamar.dump
sha256sum backups/llamar.dump > backups/llamar.dump.sha256
```

Fresh-server database restore:

```bash
git clone https://github.com/Mkali10/Llamar.git && cd Llamar
cp .env.example .env  # restore approved secrets
docker compose up -d postgres
sha256sum -c backups/llamar.dump.sha256
docker compose exec -T postgres pg_restore --clean --if-exists --no-owner --no-acl \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backups/llamar.dump
docker compose up --build -d
curl -fsS http://127.0.0.1:8080/health/ready
```

A backup is valid only after a separate restore drill succeeds and evidence is retained.
