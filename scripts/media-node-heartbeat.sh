#!/bin/sh
set -eu
: "${LLAMAR_CONTROL_URL:?LLAMAR_CONTROL_URL is required}"
: "${LLAMAR_INTERNAL_TOKEN:?LLAMAR_INTERNAL_TOKEN is required}"
: "${MEDIA_NODE_KEY:?MEDIA_NODE_KEY is required}"
command -v fs_cli >/dev/null 2>&1 || { echo 'fs_cli is required'; exit 1; }
channels="$(fs_cli -x 'show channels count' | awk '/ total\.$/{print $1;exit}')"
case "$channels" in ''|*[!0-9]*) echo 'Could not read FreeSWITCH channel count'; exit 1;; esac
payload="$(printf '{"nodeKey":"%s","activeChannels":%s,"healthy":true,"metadata":{"source":"fs_cli"}}' "$MEDIA_NODE_KEY" "$channels")"
curl --fail --silent --show-error --connect-timeout 3 --max-time 8 \
  -H "x-llamar-internal-token: $LLAMAR_INTERNAL_TOKEN" -H 'content-type: application/json' \
  --data "$payload" "${LLAMAR_CONTROL_URL%/}/v1/internal/media-nodes/heartbeat" >/dev/null
