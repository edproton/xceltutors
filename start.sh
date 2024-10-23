#!/bin/sh

echo "Running database migrations..."

# Run migrations using local kysely-ctl
pnpm kysely-ctl migrate:latest

# Start the application
exec pnpm start