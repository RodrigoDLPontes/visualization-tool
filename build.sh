#!/bin/bash
./node_modules/.bin/electron-builder build -w portable
./node_modules/.bin/electron-builder build -l AppImage
./node_modules/.bin/electron-builder build -m zip

