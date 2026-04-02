#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.deploy"

DOMAIN="${DOMAIN:-}"
ACME_EMAIL="${ACME_EMAIL:-}"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/deploy.sh --domain your.domain.com --email you@example.com

Optional:
  DOMAIN=your.domain.com ACME_EMAIL=you@example.com ./scripts/deploy.sh
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="${2:-}"
      shift 2
      ;;
    --email)
      ACME_EMAIL="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$DOMAIN" ]]; then
  read -r -p "Domain (e.g. app.example.com): " DOMAIN
fi

if [[ -z "$ACME_EMAIL" ]]; then
  read -r -p "ACME email (Let's Encrypt notifications): " ACME_EMAIL
fi

if [[ -z "$DOMAIN" || -z "$ACME_EMAIL" ]]; then
  echo "Domain and ACME email are required."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "$ROOT_DIR/.env" ]]; then
    cp "$ROOT_DIR/.env" "$ENV_FILE"
  else
    cp "$ROOT_DIR/.env.example" "$ENV_FILE"
  fi
fi

upsert_var() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    if [[ -s "$ENV_FILE" ]] && [[ "$(tail -c1 "$ENV_FILE" | wc -l)" -eq 0 ]]; then
      echo >> "$ENV_FILE"
    fi
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

ensure_var() {
  local key="$1"
  local value="$2"
  if ! grep -qE "^${key}=" "$ENV_FILE"; then
    if [[ -s "$ENV_FILE" ]] && [[ "$(tail -c1 "$ENV_FILE" | wc -l)" -eq 0 ]]; then
      echo >> "$ENV_FILE"
    fi
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

ensure_secret() {
  local key="$1"
  local current
  current="$(grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d'=' -f2- || true)"

  if [[ -z "$current" ]]; then
    local generated
    generated="$(openssl rand -base64 48 | tr -d '\n' | cut -c1-64)"
    upsert_var "$key" "$generated"
  fi
}

upsert_var "DOMAIN" "$DOMAIN"
upsert_var "ACME_EMAIL" "$ACME_EMAIL"

ensure_var "NUXT_SUPABASE_URL" "https://your-project.supabase.co"
ensure_var "NUXT_SUPABASE_KEY" "your-anon-key"
ensure_var "NUXT_SUPABASE_SERVICE_KEY" "your-service-role-key"

ensure_var "NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_live_or_test_xxx"
ensure_var "NUXT_STRIPE_SECRET_KEY" "sk_live_or_test_xxx"
ensure_var "NUXT_STRIPE_ALLOWED_PRICE_IDS" "price_xxx"
ensure_var "NUXT_STRIPE_DEFAULT_PRICE_ID" "price_xxx"

ensure_var "NUXT_STRIPE_DEFAULT_EVENT_ID" "1"
ensure_var "NUXT_STRIPE_DEFAULT_ORDER_ITEM_ID" "1"

ensure_secret "NUXT_SESSION_PASSWORD"

require_non_placeholder() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -n1 | cut -d'=' -f2- || true)"

  if [[ -z "$value" ]]; then
    echo "Missing required variable: $key"
    return 1
  fi

  case "$value" in
    *"your-anon-key"*|*"your-service-role-key"*|*"pk_live_or_test_xxx"*|*"sk_live_or_test_xxx"*|*"price_xxx"*|"sb_service_key_"* )
      echo "Variable $key still has a placeholder value."
      return 1
      ;;
  esac

  return 0
}

if ! require_non_placeholder "NUXT_SUPABASE_URL" \
  || ! require_non_placeholder "NUXT_SUPABASE_KEY" \
  || ! require_non_placeholder "NUXT_SUPABASE_SERVICE_KEY" \
  || ! require_non_placeholder "NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" \
  || ! require_non_placeholder "NUXT_STRIPE_SECRET_KEY" \
  || ! require_non_placeholder "NUXT_STRIPE_ALLOWED_PRICE_IDS" \
  || ! require_non_placeholder "NUXT_STRIPE_DEFAULT_PRICE_ID"; then
  echo
  echo "Edit $ENV_FILE and set real production values, then rerun deploy."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH."
  exit 1
fi

pushd "$ROOT_DIR" >/dev/null

docker compose --env-file .env.deploy up -d --build

echo
echo "Deployment started."
echo "App URL: https://${DOMAIN}"
echo "Env file: $ENV_FILE"
echo
echo "If this is first deploy, make sure DNS for ${DOMAIN} already points to this server."

docker compose ps

popd >/dev/null
