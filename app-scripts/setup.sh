#!/bin/bash

set -P

# Default versions
# These can/will be overridden in $PROJECT_DIR/configuration
DOJO_VERSION=1.7.1
WHEN_VERSION=0.10.3
AOP_VERSION=0.5.1
WIRE_VERSION=0.7.4
LESS_VERSION=1.1.6

# ${x%/*} is equivalent to dirname
# ${x##*/} is equivalent to basename

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SCRIPT_NAME="${0##*/}"

function usage {
	echo "Usage: $SCRIPT_NAME [-hy]"
}

function help_text {
	usage
	echo "Download all required packages and place them in 'src/js'."
	echo
	echo "  -h                 Display this message"
	echo "  -y                 Always overwrite files (don't prompt)"
}

FORCE_CONFIRM_YES=0
while getopts ":hy" opt; do
	case "$opt" in
		h)
			help_text
			exit 0
			;;
		y)
			FORCE_CONFIRM_YES=1
			;;
		\?)
			echo "$SCRIPT_NAME: invalid option -- '$OPTARG'" >&2
			usage
			exit 1
			;;
	esac
done
shift $((OPTIND-1))

PROJECT_DIR="${SCRIPT_DIR%/*}"

if [ -e "$PROJECT_DIR/configuration" ]; then
	. "$PROJECT_DIR/configuration"
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

function check_existing {
	local EXIST=""

	for file in "$@"; do
		if [ -e "$file" ]; then
			EXIST="$EXIST $file"
		fi
	done

	echo "$EXIST"
}

function confirm_file_overwrite {
	local NAME="$1"; shift
	local EXISTING=$(check_existing "$@")

	if (($FORCE_CONFIRM_YES)); then
		if [ -n "$EXISTING" ]; then
			rm -rf $EXISTING
		fi
		return 1
	fi

	if [ -n "$EXISTING" ]; then
		echo "The following files from $NAME already exist:"
		for file in $EXISTING; do
			echo ${file##*/}
		done
		echo -n "Do you want to overwrite them? [yn] "
		read -s -n 1
		if [[ "$REPLY" =~ ^[Yy]$ ]]; then
			echo "Overwriting..."
			rm -rf $EXISTING
		else
			echo "Skipping..."
			return 0
		fi
	fi

	return 1
}

echo "Setting up Dojo"
echo "==============="
confirm_file_overwrite "Dojo" "$TARGET_DIR/dojo" "$TARGET_DIR/dijit" "$TARGET_DIR/dojox" "$TARGET_DIR/util"
if (($?)); then
	echo "Fetching Dojo $DOJO_VERSION"
	$GET "http://download.dojotoolkit.org/release-$DOJO_VERSION/dojo-release-$DOJO_VERSION-src.tar.gz" | tar -C "$TARGET_DIR" --strip-components 1 -xzf -
	echo "Dojo extracted"
fi

echo

echo "Setting up when.js"
echo "=================="
WHEN_DIR="$TARGET_DIR/when"
confirm_file_overwrite "when.js" "$WHEN_DIR"
if (($?)); then
	echo "Fetching when.js $WHEN_VERSION"
	mkdir "$WHEN_DIR"
	$GET "https://github.com/briancavalier/when.js/tarball/$WHEN_VERSION" | tar -C "$WHEN_DIR" --strip-components 1 -xzf -
	echo "when.js extracted"
fi

echo

echo "Setting up aop.js"
echo "=================="
AOP_DIR="$TARGET_DIR/aop"
confirm_file_overwrite "aop.js" "$AOP_DIR"
if (($?)); then
	echo "Fetching aop.js $AOP_VERSION"
	mkdir "$AOP_DIR"
	$GET "https://github.com/briancavalier/aop.js/tarball/$AOP_VERSION" | tar -C "$AOP_DIR" --strip-components 1 -xzf -
	echo "aop.js extracted"
fi

echo

echo "Setting up wire"
echo "==============="
WIRE_DIR="$TARGET_DIR/wire"
WIRE_TMP_DIR="$TARGET_DIR/wire-tmp"
confirm_file_overwrite "wire" "$WIRE_DIR" "$WIRE_TMP_DIR"
if (($?)); then
	echo "Fetching wire $WIRE_VERSION"
	mkdir "$WIRE_TMP_DIR"
	$GET "https://github.com/briancavalier/wire/tarball/$WIRE_VERSION" | tar -C "$WIRE_TMP_DIR" --strip-components 1 -xzf -
	mv "$WIRE_TMP_DIR/wire" "$TARGET_DIR"
	mv "$WIRE_TMP_DIR/wire.js" "$WIRE_TMP_DIR/package.json" "$WIRE_DIR"
	rm -rf "$WIRE_TMP_DIR"
	echo "wire.js extracted"
fi

echo

echo "Setting up less"
echo "==============="
confirm_file_overwrite "LESS" "$TARGET_DIR/less"
if (($?)); then
	echo "Fetching LESS $LESS_VERSION"
	cd "$PROJECT_DIR"
	npm install "less@$LESS_VERSION"
	mv "$PROJECT_DIR/node_modules/less" "$TARGET_DIR"
	rm -rf "$PROJECT_DIR/node_modules"
	echo "LESS fetched"
fi
