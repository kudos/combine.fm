# See http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help
help:
	@echo
	@echo "Commands:"
	@grep -E -h '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "See README.md"
	@echo

.PHONY: start
start: podman-compose-up watch-frontend ## Start containers and watch frontend

.PHONY: build
build: ## Run `yarn run build`
	podman compose run --rm app yarn run build

.PHONY: test
test: ## Run tests
	podman compose run --rm app yarn test

.PHONY: logs
logs: ## Tail the app and worker logs
	podman compose logs -f app worker

.PHONY: migrate
migrate: ## Migrate database schema
	podman compose run --rm app yarn initdb

.PHONY: watch-frontend
watch-frontend: ## Build and watch frontend for changes
	podman compose run --rm app yarn watch-js

.PHONY: podman-compose-up
podman-compose-up: ## Start (and create) docker containers
	podman compose up -d

.PHONY: yarn
yarn: ## Update yarn dependencies
	podman compose run --rm app yarn

.PHONY: shell
shell: ## Run shell
	podman compose run --rm app sh

.PHONY: open
open: ## Open app in browser
	xdg-open http://localhost:3000
