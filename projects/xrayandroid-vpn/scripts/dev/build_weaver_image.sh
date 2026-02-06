#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
IMAGE_TAG="${IMAGE_TAG:-runner-image:latest}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-}"
CONTEXT_DIR="${CONTEXT_DIR:-}"
SKIP_BUILD="${SKIP_BUILD:-${WEAVER_SKIP_BUILD:-0}}"
DOCKER_BUILD_FLAGS="${DOCKER_BUILD_FLAGS:-}"
WEAVER_DOCKER_BUILD_FLAGS="${WEAVER_DOCKER_BUILD_FLAGS:-}"
WEAVER_BUILD_FLAGS="${WEAVER_BUILD_FLAGS:-}"
USE_BUILDX="${USE_BUILDX:-${WEAVER_USE_BUILDX:-0}}"
DOCKER_BUILDER="${DOCKER_BUILDER:-${WEAVER_DOCKER_BUILDER:-}}"
DOCKER_PROGRESS="${DOCKER_PROGRESS:-${WEAVER_DOCKER_PROGRESS:-}}"

DEFAULT_DOCKERFILE_PATH="${ROOT_DIR}/images/weaver/Dockerfile"
DEFAULT_CONTEXT_DIR="${ROOT_DIR}/images/weaver"

is_truthy() {
  case "${1:-}" in
    1|true|TRUE|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

if [ -z "$DOCKERFILE_PATH" ] && [ -f "$DEFAULT_DOCKERFILE_PATH" ]; then
  DOCKERFILE_PATH="$DEFAULT_DOCKERFILE_PATH"
fi
if [ -z "$CONTEXT_DIR" ] && [ -d "$DEFAULT_CONTEXT_DIR" ]; then
  CONTEXT_DIR="$DEFAULT_CONTEXT_DIR"
fi

if [ -z "$DOCKERFILE_PATH" ] || [ -z "$CONTEXT_DIR" ]; then
  cat <<'EOF' >&2
Set DOCKERFILE_PATH and CONTEXT_DIR for your repo.
Example:
DOCKERFILE_PATH="$PWD/images/runner/Dockerfile" CONTEXT_DIR="$PWD/images/runner" scripts/dev/build_weaver_image.sh
EOF
  exit 1
fi

if is_truthy "${SKIP_BUILD}"; then
  if docker image inspect "${IMAGE_TAG}" >/dev/null 2>&1; then
    echo "Skipping image build (using existing ${IMAGE_TAG})." >&2
    exit 0
  fi
  echo "SKIP_BUILD=1 but image not found: ${IMAGE_TAG}" >&2
  exit 1
fi

BUILD_FLAGS=()
BUILD_FLAGS_RAW="${DOCKER_BUILD_FLAGS}"
if [ -z "${BUILD_FLAGS_RAW}" ]; then
  BUILD_FLAGS_RAW="${WEAVER_DOCKER_BUILD_FLAGS}"
fi
if [ -z "${BUILD_FLAGS_RAW}" ]; then
  BUILD_FLAGS_RAW="${WEAVER_BUILD_FLAGS}"
fi
if [ -n "${BUILD_FLAGS_RAW}" ]; then
  # shellcheck disable=SC2206
  BUILD_FLAGS=(${BUILD_FLAGS_RAW})
fi

if is_truthy "${USE_BUILDX}"; then
  BUILD_CMD=(docker buildx build --load -t "${IMAGE_TAG}" -f "${DOCKERFILE_PATH}")
  if [ -n "${DOCKER_BUILDER}" ]; then
    BUILD_CMD+=(--builder "${DOCKER_BUILDER}")
  fi
else
  BUILD_CMD=(docker build -t "${IMAGE_TAG}" -f "${DOCKERFILE_PATH}")
fi

if [ -n "${DOCKER_PROGRESS}" ]; then
  BUILD_CMD+=(--progress "${DOCKER_PROGRESS}")
fi

if [ "${#BUILD_FLAGS[@]}" -gt 0 ]; then
  BUILD_CMD+=("${BUILD_FLAGS[@]}")
fi

BUILD_CMD+=("${CONTEXT_DIR}")

exec "${BUILD_CMD[@]}"
