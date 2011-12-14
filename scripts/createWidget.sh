#!/bin/bash

set -eP

function dir_name {
	local P="$1"; shift
	local N="${P%/*}"

	if [ -n "$P" ] && [ "$P" == "$N" ]; then
		N="."
	fi

	echo "$N"
}

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

TEMPLATE_PATH="${SCRIPT_DIR%/*}/templates"

function usage {
	echo "Usage: $SCRIPT_NAME WIDGET_NAME [TARGET_DIRECTORY]"
}

PROJECT_DIR="$2"

if [ -z "$2" ]; then
	PROJECT_DIR=$(pwd -P)
elif [ ! -d "$2" ]; then
	echo "TARGET_DIRECTORY must exist"
	usage
	exit 1
else
	PROJECT_DIR=$(canonical "$2")
fi

TARGET_DIR="$PROJECT_DIR/src/js"

if [ ! -d "$TARGET_DIR" ]; then
	echo "$SCRIPT_NAME only works on rishson projects."
	exit 1
fi

WIDGET_NAME="$1"

if [ "${WIDGET_NAME:0:1}" == "/" ]; then
	echo "WIDGET_NAME must not begin with '/'."
	exit 1
fi

WIDGET_NS=$(dir_name "$WIDGET_NAME")
WIDGET_CLASS="${WIDGET_NAME##*/}"

if [ -n "$WIDGET_NS" ]; then
	WIDGET_TARGET="$TARGET_DIR/$WIDGET_NS"
else
	WIDGET_TARGET="$TARGET_DIR"
fi

if [ -e "$WIDGET_TARGET" ] && [ ! -d "$WIDGET_TARGET" ]; then
	echo "The module directory specified for the widget must be a directory."
	exit 1
fi

if [ ! -e "$WIDGET_TARGET" ]; then
	mkdir -p "$WIDGET_TARGET"
fi

WIDGET_FN="$WIDGET_TARGET/$WIDGET_CLASS.js"
if [ -e "$WIDGET_FN" ]; then
	read -s -p "The module $WIDGET_NAME already exists. Do you want to overwrite it? [yn]" -n 1
	if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
		echo
		exit
	fi
	echo
	echo "Overwriting..."
fi

sed -e "s/\\\$\\\$\\\$BASENAME\\\$\\\$\\\$/$WIDGET_CLASS/" "$TEMPLATE_PATH/Widget.js" > "$WIDGET_FN"
