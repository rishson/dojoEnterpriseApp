#!/bin/bash

set -e

DOJOVERSION="1.6.1"

THISDIR=$(cd $(dirname $0) && pwd)
SRCDIR="$THISDIR/../src"
UTILDIR="$SRCDIR/js/dojo/dojo-release-${DOJOVERSION}-src/util/buildscripts"
PROFILEDIR=$(cd $THISDIR/../src/js/rishson/enterprise/build/ && pwd)
PROFILE="${PROFILEDIR}/EnterpriseProfile.js"
CSSDIR="$SRCDIR/css"

# this ain't pretty, but the dist director needs to be present if we want to use
# the constant later on (l.37) as the releaseDir param. This gets around the
# restriction of having to provide lots of ../../ in the path that are 
# different for different users
mkdir -p $THISDIR/../dist/
DISTDIR=$(cd $THISDIR/../dist/ && pwd)

if [ ! -d "$UTILDIR" ]; then
  echo "Can't find Dojo build tools -- did you run ./util/setup.sh?"
  exit 1
fi

if [ ! -f "$PROFILE" ]; then
  echo "Invalid input profile"
  exit 1
fi

echo "Using $PROFILE. CSS will be copied and JS will be built."

# clean the old distribution files
rm -rf "$DISTDIR"

# This is now cleaned up because we used a different way of creating DISTDIR 
# at the top
cd "$UTILDIR"
./build.sh profileFile=$PROFILE releaseDir=$DISTDIR
cd "$THISDIR"

# copy the css files
# todo: how to do this better?
cp -r "$CSSDIR" "$DISTDIR/css"

# copy the index.html and make it production-friendly
cp "$SRCDIR/index.html" "$DISTDIR/index.html"

sed -i -e "s/var releaseMode = false;/var releaseMode = true/" "$DISTDIR/index.html"
sed -i -e "s/js\/dojo\/dojo-release-${DOJOVERSION}-src/js/" "$DISTDIR/index.html"
# this changes the path to the CSS files in enterprise.css.
sed -i -e "s/dojo-release-${DOJOVERSION}-src//" "$DISTDIR/css/enterprise.css"
