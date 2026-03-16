.PHONY: serve build test

serve:
	docker compose up jekyll

build:
	docker compose run --rm build

test:
	docker compose run --rm htmlproofer
