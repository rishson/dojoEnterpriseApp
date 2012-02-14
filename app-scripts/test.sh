#!/bin/bash

set -P

function dir_name {
	local P="$1"; shift
	local N="${P%/*}"

	if [ -n "$P" ] && [ "$P" == "$N" ]; then
		N="."
	fi

	echo "$N"
}

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SCRIPT_NAME="${0##*/}"

PROJECT_DIR="${SCRIPT_DIR%/*}"

# The URL where the "src" directory is exposed
SRC_URL="http://localhost/${PROJECT_DIR##*/}/src"

if [ -e "$PROJECT_DIR/configuration" ]; then
	. "$PROJECT_DIR/configuration"
fi

function usage {
	echo "Usage: $SCRIPT_NAME [-hr] [-p PACKAGE_NAME] [-b BROWSER] [SUBDIRECTORY/]CLASS_NAME"
}

function invalid_browser {
	local BROWSER="$1"; shift
	echo "$SCRIPT_NAME: invalid browser -- '$BROWSER'" >&2
	usage
	echo
	echo "To see a list of valid browsers, pass 'help' to the '-b' option." 
}

function help_text {
	usage
	echo "Launch a widget's test suite in a browser."
	echo
	echo "  -h                 Display this message"
	echo "  -b BROWSER         Specify a browser to launch the test suite in"
	echo "                     To see a list of supported browsers, pass 'help'"
	echo "                     to this option (default is 'firefox')"
	echo "  -p PACKAGE_NAME    Specify the package in which to create the widget"
	echo "                     (default is 'app')"
	echo "  -r                 Run the DOH Robot test suite instead of the regular"
	echo "                     test suite"
}

ROBOT=0
BROWSER="firefox"
PACKAGE="app"
while getopts ":hb:p:r" opt; do
	case "$opt" in
		h)
			help_text
			exit 0
			;;
		b)
			BROWSER="$OPTARG"
			;;
		p)
			PACKAGE="$OPTARG"
			;;
		r)
			ROBOT=1
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

OPEN=""
OPEN_ARGS=""
if which xdg-open > /dev/null; then
	# Linux
	case "$BROWSER" in
		firefox)
			OPEN="/usr/bin/firefox"
			;;
		chrome)
			#--allow-file-access-from-files
			OPEN="/usr/bin/google-chrome"
			;;
		chromium)
			#--allow-file-access-from-files
			OPEN="/usr/bin/chromium-browser"
			;;
		help)
			echo "Browsers supported:"
			echo
			echo "  firefox   - Mozilla Firefox"
			echo "  chrome    - Google Chrome"
			echo "  chromium  - Chromium"
			exit 0
			;;
		*)
			invalid_browser "$BROWSER"
			exit 1
			;;
	esac
else
	# OS X

	OPEN="/usr/bin/open"
	case "$BROWSER" in
		firefox)
			OPEN_ARGS="-aFirefox"
			;;
		chrome)
			OPEN_ARGS="-aGoogle Chrome"
			;;
		safari)
			OPEN_ARGS="-aSafari"
			;;
		help)
			echo "Browsers supported:"
			echo
			echo "  firefox - Mozilla Firefox"
			echo "  chrome  - Google Chrome"
			echo "  safari  - Apple Safari"
			exit 0
			;;
		*)
			invalid_browser "$BROWSER"
			exit 1
			;;
	esac
fi

TARGET_DIR="$PROJECT_DIR/src/js"
TARGET_URL="$SRC_URL/js"
PACKAGE_DIR="$TARGET_DIR/$PACKAGE"
PACKAGE_URL="$TARGET_URL/$PACKAGE"

if [ ! -d "$TARGET_DIR" ]; then
	echo "$SCRIPT_NAME only works on rishson projects."
	exit 1
fi

if [ ! -d "$PACKAGE_DIR" ]; then
	echo "The package specified for the widget does not exist or is not a directory: $PACKAGE_DIR"
	exit 1
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
TESTS_DIR="$PACKAGE_DIR/tests"
TESTS_URL="$PACKAGE_URL/tests"

if [ "$WIDGET_DIR" != "." ]; then
	TESTS_DIR="$TESTS_DIR/$WIDGET_DIR"
	TESTS_URL="$TESTS_URL/$WIDGET_DIR"
fi

if (($ROBOT)); then
	TESTS_DIR="$TESTS_DIR/robot"
	TESTS_URL="$TESTS_URL/robot"
fi

if [ ! -e "$TESTS_DIR/$WIDGET_CLASS.html" ]; then
	ROBOT_TEXT=""
	if (($ROBOT)); then
		ROBOT_TEXT="robot "
	fi
	echo "The ${ROBOT_TEXT}test for '$PACKAGE/$WIDGET_NAME' does not exist."
	exit 1
fi

if [ -z "$OPEN_ARGS" ]; then
	$OPEN "$TESTS_URL/$WIDGET_CLASS.html" 2> /dev/null
else
	$OPEN "$OPEN_ARGS" "$TESTS_URL/$WIDGET_CLASS.html" 2> /dev/null
fi
