#!/bin/bash

set -e

DOJO_VERSION="1.7.0"
WHEN_VERSION="0.10.2"
WIRE_VERSION="0.7.3"

SCRIPT_PATH="$(readlink -f $0)"
SCRIPT_NAME="$(basename $SCRIPT_PATH)"
SCRIPT_DIR="$(dirname $SCRIPT_PATH)"

function usage {
	echo "Usage: $SCRIPT_NAME PROJECT_DIRECTORY"
}

PROJECT_DIR="$1"

if [ -z "$PROJECT_DIR" ]; then
	usage
	exit 1
elif [ ! -d $PROJECT_DIR ]; then
	echo "PROJECT_DIRECTORY must be a directory that exists"
	usage
	exit 1
fi

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
