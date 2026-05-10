#!/usr/bin/env bash
# Cloudflare Workers Builds — build entrypoint, used by both the Atlas and
# Marginalia projects. Reads $WORKERS_CI_BRANCH (set by Workers Builds) and
# sets DEPLOY_ENV=develop when building the develop branch so the
# noindex-on-develop Vite plugin in vite.config.ts fires. Operates on the
# current working directory, which Workers Builds sets per-project (Atlas:
# repo root, Marginalia: `marginalia/`).
#
# Dashboard usage:
#   Atlas      build command: `bash scripts/cf-build.sh`
#   Marginalia build command: `bash ../scripts/cf-build.sh`
set -euo pipefail

if [ "${WORKERS_CI_BRANCH:-}" = "develop" ]; then
  echo "cf-build: branch=develop → DEPLOY_ENV=develop"
  DEPLOY_ENV=develop yarn build
else
  echo "cf-build: branch=${WORKERS_CI_BRANCH:-<unset>} → production build"
  yarn build
fi
