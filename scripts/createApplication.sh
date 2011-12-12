#!/bin/sh

set -e

SCRIPT_PATH="$(readlink -f $0)"
SCRIPT_NAME="$(basename $SCRIPT_PATH)"
SCRIPT_DIR="$(dirname $SCRIPT_PATH)"

LIB_PATH="$(dirname $SCRIPT_DIR)"
PROJECT_NAME="$1"

function usage {
	echo "Usage: $SCRIPT_NAME PROJECT_NAME [TARGET_DIRECTORY]"
}

if [ -z $PROJECT_NAME ]; then
	usage
	exit 1
fi

TARGET_DIR="$2"

if [ -z $TARGET_DIR ]; then
	TARGET_DIR=$(pwd)
elif [ ! -d $TARGET_DIR ]; then
	echo "TARGET_DIRECTORY must exist"
	usage
	exit 1
fi

cd "$TARGET_DIRECTORY"
mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"
mkdir "scripts"

cp -r "$LIB_PATH/src" .
cp -r "$SCRIPT_DIR/build.sh" "$SCRIPT_DIR/setup.sh" scripts
