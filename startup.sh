#!/bin/sh

# unzip node_modules if not already there
if [ ! -d "node_modules" ] && [ -f "node_modules.zip" ]; then
  unzip node_modules.zip -d .
fi

# start the server
node server.js
