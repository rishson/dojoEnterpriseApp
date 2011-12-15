#!/bin/bash

set -eP

# ${x%/*} is equivalent to dirname
# ${x##*/} is equivalent to basename

function canonical {
	local P="$1"; shift
	local DIR=""
	local NAME=""

	if [ -h "$P" ]; then
		# if path exists and is a symlink
		local RL=$(readlink "$P" 2> /dev/null)
		DIR=$(cd "${P%/*}" && pwd -P)
		DIR=$(cd "$DIR" && cd "${RL%/*}" && pwd -P)
		NAME="${RL##*/}"
	elif [ -e "$P" ]; then
		# if path exists
		DIR=$(cd "${P%/*}" && pwd -P)
		if [ "$P" != "." ]; then
			NAME="${P##*/}"
		fi
	else
		# if path doesn't exist
		if [ "${P:0:1}" == "/" ]; then
			# if path starts with "/", strip it
			NAME="${P:1}"
		else
			DIR="$(pwd -P)"
			if [ "${P:0:2}" == "./" ]; then
				# if path starts with "./", strip it
				NAME="${P:2}"
			else
				NAME="$P"
			fi
		fi
	fi

	if [ -z "$DIR" ] || [ -z "$NAME" ]; then
		echo "$DIR$NAME"
	else
		echo "$DIR/$NAME"
	fi
}

SCRIPT_PATH=$(canonical "$0")
SCRIPT_DIR="${SCRIPT_PATH%/*}"
SCRIPT_NAME="${SCRIPT_PATH##*/}"

LIB_PATH="${SCRIPT_DIR%/*}"
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
	TARGET_DIR=$(canonical "$2")
fi

PROJECT_DIR="$TARGET_DIR/$PROJECT_NAME"
mkdir -p "$PROJECT_DIR/scripts"
mkdir -p "$PROJECT_DIR/src/js"

cp -r "$LIB_PATH/src/js/app" "$LIB_PATH/src/js/rishson" "$PROJECT_DIR/src/js"
cp    "$LIB_PATH/src/index.html" "$PROJECT_DIR/src"
cp -r "$SCRIPT_DIR/build.sh" "$PROJECT_DIR/scripts"

# Translate scripts to app-specific scripts
sed -e 's/^\(PROJECT_DIR="\).*\("\)$/\1${SCRIPT_DIR%\/*}\2/
/^if \[ -z "\$1" \]; then/,/^fi/d' "$SCRIPT_DIR/setup.sh" > "$PROJECT_DIR/scripts/setup.sh"
