#!/bin/bash

set -e

DOJO_VERSION="1.7.0"
WHEN_VERSION="0.10.2"
WIRE_VERSION="0.7.3"
LESS_COMMIT="9e48460eff"

SCRIPT_DIR=$(cd $(dirname -- "$0") && pwd -P)
SCRIPT_NAME=$(basename -- "$0")

function usage {
	echo "Usage: $SCRIPT_NAME PROJECT_DIRECTORY"
}

if [ -z "$1" ]; then
	usage
	exit 1
elif [ ! -d "$1" ]; then
	echo "PROJECT_DIRECTORY must be a directory that exists"
	usage
	exit 1
fi

PROJECT_DIR=$(cd "$1" && pwd -P)

if which wget >/dev/null; then
	GET="wget --no-check-certificate -O -"
elif which curl >/dev/null; then
	GET="curl -L --insecure -o -"
else
	echo "$SCRIPT_NAME requires wget or curl to be installed"
	exit 1
fi

TARGET_DIR="$PROJECT_DIR/src/js"

if [ ! -d "$TARGET_DIR" ]; then
	echo "$SCRIPT_NAME only works on rishson projects."
	exit 1
fi

echo "Fetching Dojo $DOJO_VERSION"
$GET "http://download.dojotoolkit.org/release-$DOJO_VERSION/dojo-release-$DOJO_VERSION-src.tar.gz" | tar -C "$TARGET_DIR" --strip-components 1 -xzf -
echo "Dojo extracted to $TARGET_DIR"

echo "Fetching when.js $WHEN_VERSION"
$GET "https://github.com/briancavalier/when.js/tarball/$WHEN_VERSION" | tar -C "$TARGET_DIR" --strip-components 1 -xzf - "*/when.js"
echo "when.js extracted to $TARGET_DIR"

echo "Fetching wire $WIRE_VERSION"
$GET "https://github.com/briancavalier/wire/tarball/$WIRE_VERSION" | tar -C "$TARGET_DIR" --strip-components 1 -xzf - "*/wire*"
rm -rf "$TARGET_DIR/test"
echo "wire.js extracted to $TARGET_DIR"

echo "Fetching LESS $LESS_COMMIT"
git clone https://github.com/cloudhead/less.js.git "$TARGET_DIR/less"
cd "$TARGET_DIR/less"
git checkout -q $LESS_COMMIT
rm -rf .git
echo "LESS cloned to $TARGET_DIR"
