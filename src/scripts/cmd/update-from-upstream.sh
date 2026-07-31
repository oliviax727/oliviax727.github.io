#!/usr/bin/env bash

# Merge updates from upstream/main into the current branch.
# This does not change branch tracking, so normal `git pull` still uses origin/main.
git fetch upstream

# Merge new upstream commits, preferring local content only on true conflicts.
git merge --no-edit -X ours upstream/main
