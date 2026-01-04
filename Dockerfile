FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /site

# Install bundler
RUN gem install bundler

# Copy Gemfile and install gems at runtime (due to dynamic version fetching)
# Gems are cached in a Docker volume for performance

# Expose Jekyll server port
EXPOSE 4000
