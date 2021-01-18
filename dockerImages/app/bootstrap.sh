#!/bin/sh
set -e

nginx_web_path="/usr/share/nginx/html/index.html"

# add container metadata to index.html
echo "<pre>" >> $nginx_web_path
echo "This is ecs metadata ... " >> $nginx_web_path
if [ ! -z "$ECS_CONTAINER_METADATA_URI" ]
then
    curl $ECS_CONTAINER_METADATA_URI | jq '.' >> $nginx_web_path
fi
export -p >> $nginx_web_path

echo "</pre>" >> $nginx_web_path