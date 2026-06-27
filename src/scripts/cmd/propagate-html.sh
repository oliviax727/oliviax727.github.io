# Propagate changes from the content template file to every file in the html directory
(
    html_files=(src/html/*.html)

    local_html_file=$(cat src/layout/content-template.html)

    for html in "${html_files[@]}"
    do
        if [ "$html" != "src/html/main.html" ]; then
            echo "$local_html_file" > $html
        fi
    done
)