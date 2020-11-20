#!/bin/sh

cd "$(dirname "$0")"

npm update
node index.js
git add bcd-stats.json
git add package-lock.json
git reset HEAD package.json
git commit -m "Update to BCD $(npm view @mdn/browser-compat-data version)"
git push
