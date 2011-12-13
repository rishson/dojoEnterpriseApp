#!/bin/sh

set -e

SCRIPT_DIR="$(cd $(dirname -- $0) && pwd -P)"
SCRIPT_NAME="$(basename -- $0)"

LIB_PATH="$(dirname -- $SCRIPT_DIR)"
PROJECT_NAME="$1"

function usage {
	echo "Usage: $SCRIPT_NAME PROJECT_NAME [TARGET_DIRECTORY]"
}

if [ -z $PROJECT_NAME ]; then
	usage
	exit 1
fi

TARGET_DIR="$2"

if [ -z "$2" ]; then
	TARGET_DIR=$(pwd -P)
elif [ ! -d "$2" ]; then
	echo "TARGET_DIRECTORY must exist"
	usage
	exit 1
else
	TARGET_DIR="$(cd \"$2\" && pwd -P)"
fi

cd "$TARGET_DIR"
mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"
mkdir "scripts"

cp -r "$LIB_PATH/src" .
cp -r "$SCRIPT_DIR/build.sh" "$SCRIPT_DIR/setup.sh" scripts

# Translate scripts to app-specific scripts
sed -i 's/^\(PROJECT_DIR="\).*\("\)$/\1$(dirname $SCRIPT_DIR)\2/' "scripts/setup.sh"
perl -i -pe 'BEGIN{undef $/;} s/if \[ -z "\$1" \]; then.*?fi\n\n//s' "scripts/setup.sh"
