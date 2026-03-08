#!/usr/bin/env bash

DEPLOY_HOST="${DEPLOY_HOST:-itpuh.ru}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/portfolio}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-dev}"
DEPLOY_POST_HOOK="${DEPLOY_POST_HOOK:-nginx -t && systemctl reload nginx}"
