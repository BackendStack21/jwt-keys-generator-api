#!/bin/bash
ALGO="${1:-RS256}"
echo "Algorihtm: $ALGO"

echo "> launching container..."
docker run -d -p 3000:3000 --name jwt-keys kyberneees/jwt-keys-generator-api > /dev/null
sleep 1

echo "> generating keys..."
curl -s http://localhost:3000/api/generate/$ALGO | jq "."

echo "> terminating container..."
docker rm --force jwt-keys > /dev/null