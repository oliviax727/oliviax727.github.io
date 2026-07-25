#!/usr/bin/env bash
# Compile typescript modules and entry files into a single browser-friendly bundle
(
    # Remove contents of app and types
    rm -rf ./src/scripts/app/* ./src/scripts/types/*

    # Compile to js folder
    npx tsc

    # Copy compiled ES modules to app folder
    cp -r ./src/scripts/dist/. ./src/scripts/app

    # Bundle app entry and minify for browser delivery
    npx esbuild ./src/scripts/entry.js --bundle --format=esm --platform=browser --minify --outfile=./bundle.js

    # Clean temporary files
    rm -f ./src/scripts/lib/*.cjs ./src/scripts/dist/*

    # Keep the app and type files for any potential js or type importing
)