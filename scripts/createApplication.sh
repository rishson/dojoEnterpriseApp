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
		DIR=$(cd "$(dir_name "$P")" && pwd -P)
		DIR=$(cd "$DIR" && cd "$(dir_name "$RL")" && pwd -P)
		NAME="${RL##*/}"
	elif [ -e "$P" ]; then
		# if path exists
		DIR=$(cd "$(dir_name "$P")" && pwd -P)
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

function usage {
	echo "Usage: $SCRIPT_NAME [-h] [-s] [-g GIT_REMOTE] [-u SRC_URL] PROJECT_NAME [TARGET_DIRECTORY]"
}

function help_text {
	usage
	echo "Create a Rishson project named PROJECT_NAME in the current"
	echo "  working directory or, if it is provided, in TARGET_DIRECTORY"
	echo
	echo "  -h                 Display this message"
	echo "  -s                 Run setup.sh after creating the project"
	echo "  -g                 Enable Git integration by creating a repo and adding the files to local git repo"
	echo "  -u                 The URL of this project's 'src' directory"
	echo "                     (default is http://localhost/PROJECT_NAME/src)"
}

SRC_URL=""
RUN_SETUP=0
GIT_INTEGRATION=0
GIT_REMOTE=""
while getopts ":hsgu:" opt; do
	case "$opt" in
		h)
			help_text
			exit 0
			;;
		s)
			RUN_SETUP=1
			;;
		g)
            GIT_INTEGRATION=1
            GIT_REMOTE="$OPTARG"
            ;;
		u)
			SRC_URL="$OPTARG"
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

PROJECT_NAME="$1"
if [ -z "$PROJECT_NAME" ]; then
	usage
	exit 1
fi

if [ -z "$SRC_URL" ]; then
	SRC_URL="http://localhost/$PROJECT_NAME/src"
fi

TARGET_DIR="$2"

if [ -z "$2" ]; then
	TARGET_DIR=$(pwd -P)
elif [ ! -d "$2" ]; then
	echo "CREATING TARGET_DIRECTORY"
	mkdir TARGET_DIR
else
	TARGET_DIR=$(canonical "$TARGET_DIR")
fi

if [ -e "$TARGET_DIR/$PROJECT_NAME" ]; then
	echo "A file or directory named '$PROJECT_NAME' already exists at '$TARGET_DIR'."
	echo "Please remove it and try again."
	exit 1
fi

PROJECT_DIR="$TARGET_DIR/$PROJECT_NAME"
mkdir -p "$PROJECT_DIR/src/js"

cp -r "$LIB_PATH/src/js/app" "$LIB_PATH/src/js/rishson" "$PROJECT_DIR/src/js"
cp    "$LIB_PATH/src/index.html" "$PROJECT_DIR/src"
cp -r "$LIB_PATH/app-scripts" "$PROJECT_DIR/scripts"
cp    "$LIB_PATH/app-build.profile.js" "$PROJECT_DIR/build.profile.js"

sed -e "s#^\(SRC_URL=\).*\$#\1$SRC_URL#" "$LIB_PATH/app-configuration" > "$PROJECT_DIR/configuration"


if (($RUN_SETUP)); then
	$PROJECT_DIR/scripts/setup.sh
	echo
fi

echo "Created project '$PROJECT_NAME' at '$TARGET_DIR'."

if ((!$RUN_SETUP)); then
	echo
	echo "Make sure you run 'scripts/setup.sh' from within the project directory before starting."
fi

if (($GIT_INTEGRATION)); then
	echo
	echo "Initialising git repo for '$PROJECT_NAME'."
	cd $PROJECT_DIR
	touch README.md
	echo "# $PROJECT_NAME" >> "README.md"
    echo "===================" >> "README.md"
	touch .gitignore
	echo "*.~" >> ".gitignore"
	git init
	git add README.md
	git add .gitignore
	git add configuration
    git add build.profile.js
	git add scripts
	git add src/index.html
	git add src/js/app
	git commit -am"Initial commit to add all the files created by running createApplication.sh"
    if (($GIT_REMOTE)); then
        git remote add origin $GIT_REMOTE
        git push -u origin master
        echo "Pushed initial commit to '$GIT_REMOTE'."
    fi
fi

