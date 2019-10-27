# Visualization Tool
This is the Visualization Tool used for CS 1332 which covers all data structures & algorithms taught in class. It is hosted using Github Pages, and you can visit it at: https://rodrigodlpontes.github.io/visualization-tool/.

## About

This tool is based on the already excellent [website by David Galles](https://www.cs.usfca.edu/~galles/visualization). His code was written about 10 years ago, so it doesn't use more modern JavaScript syntax (much can be improved in that aspect).

## Structure

Like any other website/web app, there are three main components to the Visualization Tool: HTML, JavaScript and CSS.

### HTML

HTML files are in the root directory. As usual, there is an `index.html` which is the initial page of the app, and an `about.html` with more information about the project.

For each data structure/algorithm page, there is a corresponding HTML file (e.g. ArrayList.html). These are pretty much copies of each other, with corresponding headers and references to JavaScript files changed.

### JavaScript

This is the bulk of the project, containing all the logic for the animations. Files are mostly located under `AlgorithmLibrary` and `AnimationLibrary`.

`AlgorithmLibrary` contains all the scripts for data structures/algorithms, so most of the work will be done there.

`AnimationLibrary` contains the logic for the underlying animations (the API, in a sense), and will (for the most part) not need to be modified.

### CSS

`visualPages.css` styles the "regular" `index.html` and `about.html` pages, and `visualizationPageStyle.css` styles data structure/algorithm pages.

## API

The animations "API" is very well documented [here](https://www.cs.usfca.edu/~galles/visualization/source.html). Existing JavaScript files are also a good reference for learning how to do things.

## Future Work

There is a lot that still needs to be improved, ranging from implementing a few remaining data structures/algorithms, making slight modifications to existing ones, bug fixing, updating the UI and making general improvements. Whatever your interest in web development is, you can probably improve your skills by contributing in that regard.

For more details on what needs to be done, check out the [Projects page](https://github.gatech.edu/rpontes3/visualization-tool/projects). What is outlined there is just to help guide development though, so feel free to contribute with whatever you think would be useful.
