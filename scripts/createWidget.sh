#!/bin/bash

set -P
shopt -s extglob

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

function relpath {
	path1="$1"; shift
	path2="$1"; shift
	orig1="$path1"
	path1="${path1%/}/"
	path2="${path2%/}/"

	while :; do
		if test ! "$path1"; then
			break
		fi
		part1="${path2#$path1}"
		if test "${part1#/}" = "$part1"; then
			path1="${path1%/*}"
			continue
		fi
		if test "${path2#$path1}" = "$path2"; then
			path1="${path1%/*}"
			continue
		fi
		break
	done
	part1="$path1"
	path1="${orig1#$part1}"
	depth="${path1//+([^\/])/..}"
	path1="${path2#$path1}"
	path1="${depth}${path2#$part1}"
	path1="${path1##+(\/)}"
	path1="${path1%/}"
	if test ! "$path1"; then
		path1=.
	fi
	printf "$path1"
}

function confirm_file_overwrite {
	local FN="$1"; shift
	local MSG="$1"; shift

	if [ -e "$FN" ]; then
		echo -n "$MSG"
		echo -n " Do you want to overwrite it? [yn] "
		read -s -n 1
		if [[ "$REPLY" =~ ^[Yy]$ ]]; then
			echo "Overwriting..."
		else
			echo "Skipping..."
			return 0
		fi
	fi

	return 1
}

SCRIPT_PATH=$(canonical "$0")
SCRIPT_DIR="${SCRIPT_PATH%/*}"
SCRIPT_NAME="${SCRIPT_PATH##*/}"

TEMPLATE_PATH="${SCRIPT_DIR%/*}/templates"

function usage {
	echo "Usage: $SCRIPT_NAME WIDGET_NAME [TARGET_DIRECTORY]"
}

TEMPLATED=0
while getopts t opt; do
	case "$opt" in
		t) TEMPLATED=1 ;;
		\?) echo "Invalid option: -$OPTARG" >&2 ;;
	esac
done
shift $((OPTIND-1))

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

if [ "$WIDGET_NS" != "." ]; then
	WIDGET_TARGET="$TARGET_DIR/$WIDGET_NS"
else
	WIDGET_TARGET="$TARGET_DIR"
fi

if [ -e "$WIDGET_TARGET" ] && [ ! -d "$WIDGET_TARGET" ]; then
	echo "The module directory specified for the widget must be a directory."
	exit 1
fi

if [ ! -e "$WIDGET_TARGET/resources" ]; then
	mkdir -p "$WIDGET_TARGET/resources"
fi

if [ ! -e "$WIDGET_TARGET/nls/es" ]; then
	mkdir -p "$WIDGET_TARGET/nls/es"
fi

WIDGET_FN="$WIDGET_TARGET/$WIDGET_CLASS.js"
WIDGET_CSS_CLASS=$(echo "$WIDGET_NAME" | sed -e "s#/\([a-z]\)#\u\1#g;s#/\([A-Z]\)#\1#g;s#/_\([A-Za-z]\)#\u\1#g")

if (($TEMPLATED)); then
	BASE_TEMPLATE_NAME="$TEMPLATE_PATH/TemplatedWidget"
else
	BASE_TEMPLATE_NAME="$TEMPLATE_PATH/Widget"
fi

confirm_file_overwrite "$WIDGET_FN" "The module $WIDGET_NAME already exists."
if (($?)); then
	sed -e "s/\\\$className\\\$/$WIDGET_CLASS/
	s/\\\$cssClassName\\\$/$WIDGET_CSS_CLASS/" "$BASE_TEMPLATE_NAME.js" > "$WIDGET_FN"
fi

WIDGET_ROOT_NLS="$WIDGET_TARGET/nls/$WIDGET_CLASS.js"
confirm_file_overwrite "$WIDGET_ROOT_NLS" "The root translation for $WIDGET_NAME alreay exists."
if (($?)); then
	cp "$TEMPLATE_PATH/nlsRoot.js" "$WIDGET_ROOT_NLS"
fi

WIDGET_ES_NLS="$WIDGET_TARGET/nls/es/$WIDGET_CLASS.js"
confirm_file_overwrite "$WIDGET_ES_NLS" "The Spanish (es) translation for $WIDGET_NAME alreay exists."
if (($?)); then
	cp "$TEMPLATE_PATH/nls.js" "$WIDGET_ES_NLS"
fi

if (($TEMPLATED)); then
	WIDGET_TEMPLATE_FN="$WIDGET_TARGET/resources/$WIDGET_CLASS.html"
	confirm_file_overwrite "$WIDGET_TEMPLATE_FN" "The template for $WIDGET_NAME already exists."
	if (($?)); then
		sed -e "s/\\\$className\\\$/$WIDGET_CLASS/
		s/\\\$cssClassName\\\$/$WIDGET_CSS_CLASS/" "$BASE_TEMPLATE_NAME.html" > "$WIDGET_TEMPLATE_FN"
	fi
fi

WIDGET_CSS_FN="$WIDGET_TARGET/resources/$WIDGET_CLASS.less"
confirm_file_overwrite "$WIDGET_CSS_FN" "The stylesheet for $WIDGET_NAME already exists."
if (($?)); then
	sed -e "s/\\\$cssClassName\\\$/$WIDGET_CSS_CLASS/" "$TEMPLATE_PATH/Widget.less" > "$WIDGET_CSS_FN"
fi

APP_LESS="$TARGET_DIR/app/resources/app.less"
if [ -e "$APP_LESS" ]; then
	REL_PATH=$(relpath "${APP_LESS%/*}" "${WIDGET_CSS_FN%/*}")
	if [ "$REL_PATH" == "." ]; then
		REL_PATH="${WIDGET_CSS_FN##*/}"
	else
		REL_PATH="$REL_PATH/${WIDGET_CSS_FN##*/}"
	fi
	REL_PATH="${REL_PATH%\.*}"

	IMPORT_TEXT="@import '$REL_PATH';"

	if [ -z "$(grep "^$IMPORT_TEXT\$" "$APP_LESS")" ]; then
		# append new @import line to app.less
		LNUM=$(awk '/^@import/{a=NR}; END{print a}' "$APP_LESS")
		sed -i -e "$LNUM a @import '$REL_PATH';" "$APP_LESS"
	fi
else
	echo "app.less does not exist; unable to add $WIDGET_NAME stylesheet to it."
fi

echo
echo "Successfully created widget $WIDGET_NAME."
echo "Open $(relpath "${PROJECT_DIR}" "$WIDGET_FN") in your editor to get started."
