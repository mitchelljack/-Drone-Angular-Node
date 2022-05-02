#!/bin/bash

# This script clones and builds the Watson Docker Swift Project.

# If any commands fail, we want the shell script to exit immediately.
set -e

if [ -z "$1" ]; then
  BRANCH="develop"
else
  BRANCH=$1
fi

echo ">> About to clone branch '$BRANCH' "
# Clone Repo
cd /root && rm -rf app-server-api && git clone -b $BRANCH https://rtvanals:Aggies99\!@gitlab.com/pa-dev/app-server-api.git
