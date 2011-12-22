#!/bin/bash

set -P

# ${x%/*} is equivalent to dirname
# ${x##*/} is equivalent to basename

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SCRIPT_NAME="${0##*/}"

if which nodejs > /dev/null; then
	NODE="nodejs"
elif which node > /dev/null; then
	NODE="node"
else
	echo "$SCRIPT_NAME requires node to be installed"
	exit 1
fi

if ! which java > /dev/null; then
	echo "$SCRIPT_NAME requires java to be installed"
fi

PROJECT_DIR="${SCRIPT_DIR%/*}"
DIST_DIR="$PROJECT_DIR/dist"
SRC_DIR="$PROJECT_DIR/src"

DOJO="$SRC_DIR/js/dojo/dojo.js"

if [ -e "$DIST_DIR" ]; then
	echo -n "Cleaning old files..."
	rm -rf "$DIST_DIR"
	echo " Done"
fi

node "$DOJO" load=build --dojoConfig "$SRC_DIR/js/app/config.js" --profile "$PROJECT_DIR/build.profile.js" --basePath "$SRC_DIR/js" --releaseDir "../../dist/js" --release "$@"

# Remove isDebug
sed -i -e '/^\s*isDebug:\s*\(true\|false\|1\|0\),$/d' "$DIST_DIR/js/app/config.js"

# Remove directories the build copies over that aren't needed
rm -rf "$DIST_DIR/js/build" "$DIST_DIR/js/doh"

# Transform LESS links to CSS links and remove inclusion of LESS
sed -e 's#<link.*rel="stylesheet/less".*href="\(.*\)\.less">#<link rel="stylesheet" href="\1.css">#
/^\s*<!-- Inclusion of LESS\..*$/d
/^\s*<script>var less = { env: "development" };<\/script>$/d
/^\s*<script src="js\/less\/dist\/less-.*\(\.min\)\?\.js"><\/script>$/d' "$SRC_DIR/index.html" > "$DIST_DIR/index.html"
