# See http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help
help:
	@echo
	@echo "Commands:"
	@grep -E -h '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "See README.md or https://github.com/udemy/website-django/blob/master/README.md"
	@echo

.PHONY: start
start: docker-compose-up watch-frontend ## Start containers and watch frontend

.PHONY: test
test: ## Run tests
	docker-compose run --rm app yarn test

.PHONY: logs
logs: ## Tail the app and worker logs
	docker-compose logs -f app worker

.PHONY: migrate
migrate: ## Migrate database schema
	docker-compose run --rm app yarn initdb

.PHONY: watch-frontend
watch-frontend: ## Build and watch frontend for changes
	docker-compose run --rm app yarn watch-js

.PHONY: docker-compose-up
docker-compose-up: ## Start (and create) docker containers
	docker-compose up -d

.PHONY: yarn
yarn: ## Update yarn dependencies
	docker-compose run --rm app yarn
