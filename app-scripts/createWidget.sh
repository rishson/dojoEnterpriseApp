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

FORCE_CONFIRM_YES=0
function confirm_file_overwrite {
	local FN="$1"; shift
	local MSG="$1"; shift

	if (($FORCE_CONFIRM_YES)); then
		return 1
	fi

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

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SCRIPT_NAME="${0##*/}"

PROJECT_DIR="${SCRIPT_DIR%/*}"
TEMPLATE_PATH="$SCRIPT_DIR/templates"

function usage {
	echo "Usage: $SCRIPT_NAME [-hty] [-p PACKAGE_NAME] [SUBDIRECTORY/]CLASS_NAME"
}

function help_text {
	usage
	echo "Create a CLASS_NAME widget and supporting files in PACKAGE_NAME."
	echo "  If SUBDIRECTORY is specified the subdirectory will be created in"
	echo "  PACKAGE_NAME and the widget files will be created in the subdirectory."
	echo
	echo "  -h                 Display this message"
	echo "  -t                 Create a templated widget"
	echo "  -y                 Always overwrite files (don't prompt)"
	echo "  -p PACKAGE_NAME    Specify the package in which to create the widget"
	echo "                     (if this option isn't specified, default is 'app')"

}

TEMPLATED=0
PACKAGE="app"
while getopts ":htyp:" opt; do
	case "$opt" in
		h)
			help_text
			exit 0
			;;
		t)
			TEMPLATED=1
			;;
		y)
			FORCE_CONFIRM_YES=1
			;;
		p)
			PACKAGE="$OPTARG"
			;;
		:)
			echo "$SCRIPT_NAME: '$OPTARG' requires an argument." >&2
			usage
			exit 1
			;;
		\?)
			echo "$SCRIPT_NAME: invalid option -- '$OPTARG'" >&2
			usage
			exit 1
			;;
	esac
done
shift $((OPTIND-1))

TARGET_DIR="$PROJECT_DIR/src/js"
PACKAGE_DIR="$TARGET_DIR/$PACKAGE"

if [ ! -d "$TARGET_DIR" ]; then
	echo "$SCRIPT_NAME only works on rishson projects."
	exit 1
fi

if [ ! -d "$PACKAGE_DIR" ]; then
	mkdir "$PACKAGE_DIR"
	#echo "The package specified for the widget does not exist or is not a directory: $PACKAGE_DIR"
	#exit 1
fi

WIDGET_NAME="$1"

if [ "${WIDGET_NAME:0:1}" == "/" ]; then
	echo "WIDGET_NAME must not begin with '/'."
	exit 1
fi

if [ -z "$WIDGET_NAME" ]; then
	echo "A widget classname is required."
	usage
	exit 1
fi

WIDGET_DIR=$(dir_name "$WIDGET_NAME")
WIDGET_CLASS="${WIDGET_NAME##*/}"

if [ "$WIDGET_DIR" != "." ]; then
	WIDGET_TARGET="$PACKAGE_DIR/$WIDGET_DIR"
	TESTS_DIR="$PACKAGE_DIR/tests/$WIDGET_DIR"
else
	WIDGET_TARGET="$PACKAGE_DIR"
	TESTS_DIR="$PACKAGE_DIR/tests"
fi

ROBOT_TESTS_DIR="$TESTS_DIR/robot"

if [ ! -e "$WIDGET_TARGET/resources" ]; then
	mkdir -p "$WIDGET_TARGET/resources"
fi

if [ ! -e "$WIDGET_TARGET/nls/es" ]; then
	mkdir -p "$WIDGET_TARGET/nls/es"
fi

if [ ! -e "$ROBOT_TESTS_DIR" ]; then
	mkdir -p "$ROBOT_TESTS_DIR"
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

WIDGET_TEST_FN="$TESTS_DIR/$WIDGET_CLASS.html"
confirm_file_overwrite "$WIDGET_TEST_FN" "The test for $WIDGET_NAME already exists."
if (($?)); then
	PATH_TO_JS=$(relpath "${WIDGET_TEST_FN%/*}" "$TARGET_DIR")
	PATH_TO_CSS=$(relpath "$TESTS_DIR" "${WIDGET_CSS_FN%/*}")
	sed -e "s/\\\$className\\\$/$WIDGET_CLASS/
	s#\\\$widgetName\\\$#$PACKAGE/$WIDGET_NAME#
	s#\\\$pathToJs\\\$#$PATH_TO_JS#
	s#\\\$pathToCss\\\$#$PATH_TO_CSS#" "$TEMPLATE_PATH/test.html" > "$WIDGET_TEST_FN"
fi

WIDGET_ROBOT_FN="$ROBOT_TESTS_DIR/$WIDGET_CLASS.html"
confirm_file_overwrite "$WIDGET_ROBOT_FN" "The robot test for $WIDGET_NAME already exists."
if (($?)); then
	PATH_TO_JS=$(relpath "${WIDGET_ROBOT_FN%/*}" "${TARGET_DIR}")
	sed -e "s/\\\$className\\\$/$WIDGET_CLASS/
	s#\\\$pathToJs\\\$#$PATH_TO_JS#" "$TEMPLATE_PATH/robot.html" > "$WIDGET_ROBOT_FN"
fi

echo
echo "Successfully created widget $WIDGET_NAME."
echo "Open $(relpath "${PROJECT_DIR}" "$WIDGET_FN") in your editor to get started."
