# Contributing

Hi there! This document outlines some rules for contributing to the site.

## What to fix

There is a lot that still needs to be improved, ranging from implementing more data structures and algorithms, making slight modifications to existing ones, bug fixing, updating the UI and making general improvements. Whatever your interest in web development is, you can probably improve your skills by contributing in that regard!

For more details on what needs to be done, check out the [Issues tab](https://github.com/RodrigoDLPontes/visualization-tool/issues).

## Structure

The site was created using [create-react-app](https://github.com/facebook/create-react-app) application. It also uses [Single Page Apps for GitHub Pages](https://github.com/rafrex/spa-github-pages) for compatibility with GitHub Pages.

`src/algo/` contains data structure/algorithm-specific scripts

`src/anim/` contains the base animation API

`src/screens/` contains the top-level screens (the homepage, the algorithm screen)

## Animation API

The animation API is very well documented [here](https://www.cs.usfca.edu/~galles/visualization/source.html). However, some changes have been made to it as part of the conversion to ES6, so existing JavaScript files are also a good reference for learning how to do things. All functions can be found in `AnimationMain.js`.

## Dev Environment Setup

This repository requires `node`/`npm` installed.

We recommend [VSCode](https://code.visualstudio.com/) with extensions for [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) installed. We also recommend turning on "format on save" (`editor.formatOnSave`) to handle automatic prettier formatting.

## Running Locally

This repository requires `node`/`npm`

1. Clone the repository
2. `cd` into the project directory
3. `npm install`
4. `npm run start`
5. The site should be locally accessible from `localhost:3000`

## Submitting a PR

When you submit a pull request, please reference the issue or project task your change addresses. Additionally, to maintain a high level of code quality, please ensure it passes ESLint and Prettier using the following commands:

-   `npm run lint`
-   `npm run prettier`
