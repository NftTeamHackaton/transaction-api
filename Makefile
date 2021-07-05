export TAG=master

# -- Settings ------------------------------------------------------

compose_local = -f docker-compose.yml -f docker-compose.local.yml

container_prefix = nft

# -- Dev Wrk -------------------------------------------------------

dev-start:
	docker-compose $(compose_local) start

dev-stop:
	docker-compose $(compose_local) stop

dev-up:
	docker-compose $(compose_local) up -d

dev-up-down:
	docker-compose $(compose_local) stop
	docker-compose $(compose_local) up -d

dev-up-no-daemon:
	docker-compose $(compose_local) up

dev-build-no-cache:
	docker-compose $(compose_local) build --no-cache

dev-up-build:
	docker-compose $(compose_local) up --build -V -d

dev-up-build-no-daemon:
	docker-compose $(compose_local) up --build

migration-run:
	docker exec -u root  -it $(container_prefix)-api-dev npx typeorm migration:run

migration-create:
	docker exec -u root -it $(container_prefix)-api-dev npx typeorm -n $(name) migration:generate

drop-db:
	docker exec -u root  -it $(container_prefix)-api-dev npx typeorm schema:drop

# -- Into ---------------------------------------------------------

enter-api:
	docker exec -it $(container_prefix)-api-dev bash -c 'HOME=/bash/home bash'

# -- Logs ---------------------------------------------------------

logs-api:
	docker logs -f $(container_prefix)-api-dev
