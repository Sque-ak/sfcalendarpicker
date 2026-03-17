#!/usr/bin/env bash
set -euo pipefail

# install.sh   Install superset-plugin-filter-calendar into a running
#              Superset instance and rebuild the frontend.
#
# Usage:
#   git clone https://github.com/Sque-ak/sfcalanderpicker.git
#   cd sfcalanderpicker
#   sudo bash install.sh [/path/to/superset-frontend]
#
# Default FRONTEND path: /app/superset-frontend

FRONTEND="${1:-/app/superset-frontend}"
PLUGIN_NAME="superset-plugin-filter-calendar"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo " Superset Calendar Filter Install Script"
echo "Frontend path: ${FRONTEND}"

# ── Verify frontend exists ──
if [ ! -d "${FRONTEND}" ]; then
  echo "ERROR: Superset frontend not found at ${FRONTEND}"
  echo "Pass the correct path: bash install.sh /your/superset-frontend"
  exit 1
fi

# ── 1. Copy plugin package into frontend tree ──
DEST="${FRONTEND}/packages/${PLUGIN_NAME}"
echo ""
echo "1/4  Copying plugin to ${DEST} ..."
rm -rf "${DEST}"
mkdir -p "${DEST}/src"
cp "${SCRIPT_DIR}/package.json" "${DEST}/package.json"
cp "${SCRIPT_DIR}/tsconfig.json" "${DEST}/tsconfig.json"
cp -r "${SCRIPT_DIR}/src/." "${DEST}/src/"
echo "     Done."

# ── 2. Add plugin as dependency ──
echo "2/4  Adding dependency to frontend package.json ..."
cd "${FRONTEND}"
node -e "
  const pkg = require('./package.json');
  if (!pkg.dependencies) pkg.dependencies = {};
  pkg.dependencies['${PLUGIN_NAME}'] = 'file:./packages/${PLUGIN_NAME}';
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  console.log('     Added: ${PLUGIN_NAME} -> file:./packages/${PLUGIN_NAME}');
"

# ── 3. Register plugin in MainPreset ──
echo "3/4  Registering plugin in MainPreset ..."
node "${SCRIPT_DIR}/scripts/register-plugin.js" "${FRONTEND}"

# ── 4. Rebuild frontend ──
echo "4/4  Rebuilding frontend (npm install + build) ..."
npm install --legacy-peer-deps
npm run build

echo ""
echo " Installation complete!"
echo " Restart Superset to load the new filter."
