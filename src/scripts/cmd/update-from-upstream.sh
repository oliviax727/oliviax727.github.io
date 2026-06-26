# Force pull git changes from the website template (upstream)
(
    # Fetch changes from upstream
    git fetch upstream

    # Update files from upstream - favicons, icons, npm packages, script files, css
    git checkout upstream/main -- \
    src/img/favicons src/img/icons \
    package.json package-lock.json eslint.config.ts \
    style.css 404.html .gitignore babel.config.json LICENSE robots.txt tsconfig.json \
    src/scripts \
    src/css
    
    # Reinstall npm modules
    npm i

    # Fix easier audited issues
    npm audit fix

    # Add all items to git
    git add .

    # Do not commit, allow the user to do such
)