.PHONY: install up down migrate test backup restore logs smoke

install:
	sh scripts/install.sh
up:
	docker compose up --build -d
down:
	docker compose down
migrate:
	docker compose run --rm migrate
test:
	docker compose run --rm api npm test
backup:
	sh scripts/backup.sh
restore:
	@test -n "$(ARCHIVE)" || (echo 'Usage: make restore ARCHIVE=backups/file.tar.gz' && exit 1)
	sh scripts/restore.sh "$(ARCHIVE)"
logs:
	docker compose logs -f --tail=200
smoke:
	sh scripts/smoke.sh
