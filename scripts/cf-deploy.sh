#!/usr/bin/env bash
# Cloudflare Workers Builds — deploy entrypoint, used by both the Atlas and
# Marginalia projects. Reads $WORKERS_CI_BRANCH and routes the develop
# branch to the develop wrangler env (`thebudgetatlas-develop` /
# `marginalia-develop`); everything else deploys the top-level (prod)
# config. Wrangler reads the local wrangler.jsonc, so the same script works
# from either project's root.
#
# Dashboard usage:
#   Atlas      deploy command: `bash scripts/cf-deploy.sh`
#   Marginalia deploy command: `bash ../scripts/cf-deploy.sh`
set -euo pipefail

if [ "${WORKERS_CI_BRANCH:-}" = "develop" ]; then
  echo "cf-deploy: branch=develop → wrangler deploy --env develop"
  npx wrangler deploy --env develop
else
  echo "cf-deploy: branch=${WORKERS_CI_BRANCH:-<unset>} → wrangler deploy (production)"
  npx wrangler deploy
fi
