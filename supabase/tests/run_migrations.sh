#!/bin/sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
container_name="dental-clinic-pg-test-$$"

cleanup() {
  docker rm -f "$container_name" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker run --detach \
  --name "$container_name" \
  --env POSTGRES_PASSWORD=integration-test-only \
  --env POSTGRES_DB=dental_clinic_test \
  postgres:15-alpine >/dev/null

attempt=0
until docker exec "$container_name" pg_isready -U postgres -d dental_clinic_test >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "PostgreSQL did not become ready" >&2
    exit 1
  fi
  sleep 1
done

docker exec -i "$container_name" \
  psql -v ON_ERROR_STOP=1 -U postgres -d dental_clinic_test \
  < "$project_dir/supabase/tests/bootstrap_supabase.sql"

for migration in "$project_dir"/supabase/migrations/*.sql; do
  echo "Applying $(basename -- "$migration")"
  docker exec -i "$container_name" \
    psql -v ON_ERROR_STOP=1 -U postgres -d dental_clinic_test \
    < "$migration"
done

docker exec -i "$container_name" \
  psql -v ON_ERROR_STOP=1 -U postgres -d dental_clinic_test \
  < "$project_dir/supabase/tests/security_foundation.integration.sql"

echo "All migrations and security integration assertions passed"
