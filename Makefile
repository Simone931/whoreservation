uname_S := $(shell uname -s)

all: check-env-file build build-terraform-cli up

build:
	docker-compose build
	@echo "Application has been built succesfully."

up:
	docker-compose down -v
	docker-compose up -d

cli:
	docker-compose run --rm app bash

logs:
	docker-compose logs -f

unit-test:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn test"

lint:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn lint"

stage-deploy: stage-create-cert
	docker-compose run --rm -w /usr/src/app app bash -c "yarn deploy stage"

stage-delete:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn delete stage"

stage-create-cert:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn create-cert stage"

stage-delete-cert:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn delete-cert stage"

check-env-file:
	@test -f .env || { echo ".env file does not exists. You can create one starting from env.template"; exit 1; }

build-terraform-cli:
	docker build -t santagostino/terraform-cli ./dashboard

terraform-cli:
	touch .env || true
	docker run --rm -it --workdir /app \
	--entrypoint bash -v $${PWD}/dashboard:/app \
	--env-file .env \
	santagostino/terraform-cli

docs-cli:
	docker-compose run --rm docs ash

local:
	docker-compose -f docker-compose-local.yml up -d --build