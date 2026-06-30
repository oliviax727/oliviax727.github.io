# Compile typescript modules and entry files into a single browser-friendly bundle
(
    # Remove contents of app and types
    rm -rf ./src/scripts/app/* ./src/scripts/types/*

    # Compile to js folder
    tsc

    # Babelify
    ./node_modules/.bin/babel ./src/scripts/dist --out-dir ./src/scripts/app

    # Transpile ES module entry file for Browserify compatibility
    ./node_modules/.bin/babel ./src/scripts/entry.js --out-file ./src/scripts/entry.cjs

    # Transpile all library modules
    #lib_files=(./src/scripts/lib/*.js)
    #for file in "${lib_files[@]}"; do
    #    ./node_modules/.bin/babel "${file}" --out-file "${file/js/cjs}"
    #done

    # Browserify
    npx browserify ./src/scripts/entry.cjs | npx terser --compress > ./bundle.js

    # Clean temporary files
    rm -f ./src/scripts/entry.cjs ./src/scripts/lib/*.cjs ./src/scripts/dist/*

    # Keep the app and type files for any potential js or type importing
)