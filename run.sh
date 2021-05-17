#!/bin/sh

cd "$(dirname "$0")"

npm update
node index.js
git add bcd-stats.json
git add package-lock.json
git checkout main -- package.json
git commit -m "Update to BCD $(npm view @mdn/browser-compat-data version)"
git push
