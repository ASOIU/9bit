# Development Guide

## Prerequisites

Choose one of the following setups:

### Option A: Docker (recommended)

- Docker
- Docker Compose

### Option B: Native

- Ruby 3.2+
- Bundler (`gem install bundler`)

---

## Quick Start with Docker

### Start development server

```bash
docker compose up
```

Site available at http://localhost:4000 with live reload enabled.

**Note:** First run takes longer as it installs Ruby gems.

### Build static site only

```bash
docker compose run --rm build
```

Output goes to `_site/` directory.

### Check for broken links and images

```bash
docker compose run --rm htmlproofer
```

This builds the site and runs html-proofer to detect:
- Broken internal links
- Missing images
- Invalid anchors

### Rebuild Docker image

After changing Gemfile:

```bash
docker compose build --no-cache
```

---

## Native Setup

### Install dependencies

```bash
bundle install
```

### Start development server

```bash
bundle exec jekyll serve
```

Site available at http://localhost:4000

### Build static site

```bash
bundle exec jekyll build
```

### HTTPS testing (optional)

Generate test certificates:

```bash
openssl req -x509 -newkey rsa:4096 -keyout test.key -out test.crt -days 365 -nodes
```

Run with SSL:

```bash
bundle exec jekyll serve --ssl-key test.key --ssl-cert test.crt
```

---

## Link Validation

### Using html-proofer

```bash
gem install html-proofer
bundle exec jekyll build
htmlproofer ./_site --disable-external --ignore-urls '/taxonomy/,/#/'
```

Options:
- `--disable-external` - Skip external URL checks (faster)
- `--ignore-urls '/taxonomy/,/#/'` - Ignore JS-based taxonomy routes and anchor links
- `--allow-missing-href` - Don't fail on missing href attributes

---

## Project Configuration

| File | Purpose |
|------|---------|
| `_config.yml` | Jekyll site configuration |
| `Gemfile` | Ruby dependencies |
| `Dockerfile` | Docker image definition |
| `docker-compose.yml` | Docker services configuration |

---

## Common Issues

### Bundle install fails

Clear cache and retry:

```bash
rm -rf vendor/bundle
bundle install
```

With Docker:

```bash
docker compose down -v
docker compose up --build
```

### Port already in use

```bash
# Find process using port 4000
lsof -i :4000

# Or use different port
bundle exec jekyll serve --port 4001
```

### Changes not reflecting

Jekyll sometimes needs restart for `_config.yml` changes. Stop server and run again.
