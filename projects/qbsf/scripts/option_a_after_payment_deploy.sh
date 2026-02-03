#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Option A one-shot deploy

This script:
  1) Deploys Salesforce metadata from deploy_temp/
  2) Creates/updates QB_Integration_Settings__c (org default)
  3) Deploys middleware to pve.atocomm.eu and runs health check

Hard safety gate:
  Set CONFIRM_DEPLOY=YES in the environment (or CONFIRM_PAYMENT=YES for legacy).

Usage:
  CONFIRM_DEPLOY=YES ./scripts/option_a_after_payment_deploy.sh [options]

Options:
  --target-org <alias>          Default: myorg
  --source-dir <path>           Default: deploy_temp (relative to repo root)
  --wait <minutes>              Default: 30
  --dry-run                     Salesforce deploy check-only (skips middleware)
  --skip-sf                      Skip Salesforce deploy
  --skip-settings                Skip QB_Integration_Settings__c upsert
  --skip-middleware              Skip middleware deploy + health check

  --settings-name <name>         Default: Default
  --middleware-endpoint <url>    Default: https://sqint.atocomm.eu
  --middleware-api-key <key>     Default: (Option A key from docs)
  --qb-realm-id <id>             Default: 9130354519120066

  --ssh-host <host>              Default: pve.atocomm.eu
  --ssh-port <port>              Default: 2323
  --ssh-user <user>              Default: roman
  --remote-dir <path>            Default: /opt/qb-integration

Examples:
  # Full run
  CONFIRM_DEPLOY=YES ./scripts/option_a_after_payment_deploy.sh

  # Dry-run only (no org changes)
  CONFIRM_DEPLOY=YES ./scripts/option_a_after_payment_deploy.sh --dry-run

  # Only SF deploy + settings, no middleware
  CONFIRM_DEPLOY=YES ./scripts/option_a_after_payment_deploy.sh --skip-middleware
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 2
  fi
}

TARGET_ORG="myorg"
SOURCE_DIR="deploy_temp"
WAIT_MINUTES="30"
DRY_RUN="false"
SKIP_SF="false"
SKIP_SETTINGS="false"
SKIP_MIDDLEWARE="false"

SETTINGS_NAME="Default"
MIDDLEWARE_ENDPOINT="https://sqint.atocomm.eu"
MIDDLEWARE_API_KEY_DEFAULT="UPCzgiXsPuXB4GiLuuzjqtXY4+4mGt+vXOmU4gaNCvM="
MIDDLEWARE_API_KEY="${MIDDLEWARE_API_KEY_DEFAULT}"
QB_REALM_ID="9130354519120066"

SSH_HOST="pve.atocomm.eu"
SSH_PORT="2323"
SSH_USER="roman"
REMOTE_DIR="/opt/qb-integration"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target-org) TARGET_ORG="${2:-}"; shift 2;;
    --source-dir) SOURCE_DIR="${2:-}"; shift 2;;
    --wait) WAIT_MINUTES="${2:-}"; shift 2;;
    --dry-run) DRY_RUN="true"; shift;;
    --skip-sf) SKIP_SF="true"; shift;;
    --skip-settings) SKIP_SETTINGS="true"; shift;;
    --skip-middleware) SKIP_MIDDLEWARE="true"; shift;;
    --settings-name) SETTINGS_NAME="${2:-}"; shift 2;;
    --middleware-endpoint) MIDDLEWARE_ENDPOINT="${2:-}"; shift 2;;
    --middleware-api-key) MIDDLEWARE_API_KEY="${2:-}"; shift 2;;
    --qb-realm-id) QB_REALM_ID="${2:-}"; shift 2;;
    --ssh-host) SSH_HOST="${2:-}"; shift 2;;
    --ssh-port) SSH_PORT="${2:-}"; shift 2;;
    --ssh-user) SSH_USER="${2:-}"; shift 2;;
    --remote-dir) REMOTE_DIR="${2:-}"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option: $1" >&2; usage; exit 2;;
  esac
done

confirm_gate="${CONFIRM_DEPLOY:-${CONFIRM_PAYMENT:-}}"
if [[ "${confirm_gate}" != "YES" ]]; then
  echo "Refusing to run: safety gate is enabled." >&2
  echo "Set CONFIRM_DEPLOY=YES to proceed." >&2
  exit 1
fi

require_cmd sf
require_cmd jq

if [[ "${SKIP_MIDDLEWARE}" != "true" && "${DRY_RUN}" != "true" ]]; then
  require_cmd ssh
  require_cmd scp
  require_cmd npm
  require_cmd curl
fi

SOURCE_DIR_ABS="${SOURCE_DIR}"
if [[ "${SOURCE_DIR}" != /* ]]; then
  SOURCE_DIR_ABS="${ROOT_DIR}/${SOURCE_DIR}"
fi

echo "Target org alias: ${TARGET_ORG}"
org_display_json="$(sf org display -o "${TARGET_ORG}" --json)"
ORG_ID="$(echo "${org_display_json}" | jq -r '.result.id')"
echo "${org_display_json}" | jq -r '.result | "OrgId: \(.id)\nUsername: \(.username)\nInstance: \(.instanceUrl)\nStatus: \(.connectedStatus)"'
echo
read -r -p "Type DEPLOY to continue: " confirm
if [[ "${confirm}" != "DEPLOY" ]]; then
  echo "Cancelled."
  exit 0
fi

mkdir -p "${ROOT_DIR}/ignore/deploy_reports"

if [[ "${SKIP_SF}" != "true" ]]; then
  if [[ ! -d "${SOURCE_DIR_ABS}/main/default" ]]; then
    echo "Missing source dir: ${SOURCE_DIR_ABS}/main/default" >&2
    exit 2
  fi

  if [[ -f "${SOURCE_DIR_ABS}/main/default/objects/Opportunity/fields/Supplier__c.field-meta.xml" ]]; then
    echo "ERROR: ${SOURCE_DIR_ABS}/main/default/objects/Opportunity/fields/Supplier__c.field-meta.xml exists." >&2
    echo "Do NOT deploy Supplier__c metadata to Roman's org (referenceTo mismatch)." >&2
    exit 2
  fi

  echo "Salesforce deploy source: ${SOURCE_DIR_ABS}"
  echo "Deploy mode: $([[ "${DRY_RUN}" == "true" ]] && echo "DRY-RUN (check-only)" || echo "REAL")"

  deploy_cmd=(sf project deploy start --source-dir "${SOURCE_DIR_ABS}" --target-org "${TARGET_ORG}" --test-level RunLocalTests --wait "${WAIT_MINUTES}" --json)
  if [[ "${DRY_RUN}" == "true" ]]; then
    deploy_cmd+=(--dry-run)
  fi

  # NOTE: Some sf CLI versions incorrectly exit non-zero while still returning a deploy id.
  # Example: "MetadataTransferError: Missing message metadata.transfer:Finalizing for locale en_US."
  deploy_start_json="$("${deploy_cmd[@]}" 2>&1 || true)"
  deploy_id="$(echo "${deploy_start_json}" | jq -r '.result.id // .data.id // empty')"

  if [[ -z "${deploy_id}" ]]; then
    echo "Deploy start did not return a deploy id. Output:" >&2
    echo "${deploy_start_json}" >&2
    exit 1
  fi

  echo "${deploy_start_json}" > "${ROOT_DIR}/ignore/deploy_reports/${deploy_id}_start.json"
  echo "Deploy ID: ${deploy_id}"

  sf project deploy report --job-id "${deploy_id}" --target-org "${TARGET_ORG}" --json > "${ROOT_DIR}/ignore/deploy_reports/${deploy_id}_report.json"
  deploy_status="$(jq -r '.result.status' "${ROOT_DIR}/ignore/deploy_reports/${deploy_id}_report.json")"
  echo "Deploy status: ${deploy_status}"

  if [[ "${deploy_status}" != "Succeeded" ]]; then
    echo "Deploy failed. Report saved to:" >&2
    echo "  ${ROOT_DIR}/ignore/deploy_reports/${deploy_id}_report.json" >&2
    exit 1
  fi
fi

if [[ "${SKIP_SETTINGS}" != "true" ]]; then
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "Skipping QB_Integration_Settings__c upsert in --dry-run mode."
  else
    echo "Upserting QB_Integration_Settings__c org default (SetupOwnerId='${ORG_ID}')"
    existing_id="$(
      sf data query -o "${TARGET_ORG}" --result-format json \
        -q "SELECT Id FROM QB_Integration_Settings__c WHERE SetupOwnerId='${ORG_ID}' LIMIT 1" \
      | jq -r '.result.records[0].Id // empty'
    )"

    if [[ -n "${existing_id}" ]]; then
      sf data update record -o "${TARGET_ORG}" -s QB_Integration_Settings__c -i "${existing_id}" \
        -v "Middleware_Endpoint__c=${MIDDLEWARE_ENDPOINT} API_Key__c=${MIDDLEWARE_API_KEY} QB_Realm_ID__c=${QB_REALM_ID}" >/dev/null
      echo "Updated org-default settings record: ${existing_id}"
    else
      create_json="$(
        sf data create record -o "${TARGET_ORG}" -s QB_Integration_Settings__c --json \
          -v "SetupOwnerId=${ORG_ID} Name=${SETTINGS_NAME} Middleware_Endpoint__c=${MIDDLEWARE_ENDPOINT} API_Key__c=${MIDDLEWARE_API_KEY} QB_Realm_ID__c=${QB_REALM_ID}"
      )"
      created_id="$(echo "${create_json}" | jq -r '.result.id')"
      echo "Created org-default settings record: ${created_id}"
    fi
  fi
fi

if [[ "${SKIP_MIDDLEWARE}" != "true" ]]; then
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "Skipping middleware deploy in --dry-run mode."
  else
    MIDDLEWARE_SRC="${ROOT_DIR}/deployment/sf-qb-integration-final"

    if [[ ! -d "${MIDDLEWARE_SRC}/src" ]]; then
      echo "Missing middleware source: ${MIDDLEWARE_SRC}/src" >&2
      exit 2
    fi

    echo "Deploying middleware to ${SSH_USER}@${SSH_HOST}:${SSH_PORT} (${REMOTE_DIR})"
    echo "You will be prompted for the SSH password (interactive)."

    ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "test -d '${REMOTE_DIR}'" >/dev/null

    backup_ts="$(date +%Y%m%d_%H%M%S)"
    backup_path="${REMOTE_DIR}.backup.${backup_ts}"
    if ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "cp -r '${REMOTE_DIR}' '${backup_path}'" >/dev/null 2>&1; then
      echo "Backup created: ${backup_path}"
    else
      fallback_backup="~/$(basename "${REMOTE_DIR}").backup.${backup_ts}"
      echo "WARN: Could not write backup to ${backup_path}; creating ${fallback_backup}"
      ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "cp -r '${REMOTE_DIR}' ${fallback_backup}" >/dev/null
    fi

    scp -r -P "${SSH_PORT}" "${MIDDLEWARE_SRC}/src" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/" >/dev/null
    scp -P "${SSH_PORT}" "${MIDDLEWARE_SRC}/package.json" "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/" >/dev/null

    ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "rm -rf '${REMOTE_DIR}/tests'" >/dev/null || true

    # Only run npm install when the deployment user can write node_modules/package-lock.
    if ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "cd '${REMOTE_DIR}' && test -w node_modules && test -w package-lock.json"; then
      ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "cd '${REMOTE_DIR}' && npm install" >/dev/null
    else
      echo "Skipping npm install (node_modules/package-lock not writable)."
    fi

    # Avoid pkill killing the SSH shell by using a pattern that doesn't appear verbatim in the remote commandline.
    ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "pkill -f '[n]ode src/server.js' || true" >/dev/null
    ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "cd '${REMOTE_DIR}' && nohup node src/server.js > server.log 2>&1 &" >/dev/null
    ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" "pgrep -f '[n]ode src/server.js' >/dev/null" >/dev/null

    echo "Health check: ${MIDDLEWARE_ENDPOINT}/api/health"
    curl -sS -H "X-API-Key: ${MIDDLEWARE_API_KEY}" "${MIDDLEWARE_ENDPOINT}/api/health" | jq .
  fi
fi

echo "Done."
