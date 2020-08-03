# Visualization Tool
This is the source code for the Visualization Tool used for Georgia Tech's CS 1332 which covers all data structures & algorithms taught in class. It is hosted using GitHub Pages, and you can visit it at: https://csvistool.com.

## About

This tool is based on the already excellent [website by David Galles](https://www.cs.usfca.edu/~galles/visualization), and has been updated to include more data structures and algorithms, as well as to use ES6 syntax and React. 
The CS1332 Visualization Tool was adapted and expanded by [Rodrigo Pontes](https://rodrigodlpontes.github.io/website/), with the help of Miguel de los Reyes and Alex McQuilkin and under the supervision of Prof. Mary Hudachek-Buswell. It includes the data structures and algorithms as they are presented in the course.

## Structure

The structure of the project is the same as a regular [create-react-app](https://github.com/facebook/create-react-app) application, but also uses [Single Page Apps for GitHub Pages](https://github.com/rafrex/spa-github-pages) for compatibility with GitHub Pages. Scripts related to the animations of each data structure and algorithm can be found under `src/algo/`, while the underlying animation "library" can be found under `src/anim/`. Other React related and miscellaneous files can be found under `src/`. 

## API

The animation API is very well documented [here](https://www.cs.usfca.edu/~galles/visualization/source.html). However, some changes have been made to it as part of the conversion to ES6, so existing JavaScript files are also a good reference for learning how to do things. All functions can be found in `AnimationMain.js`.

## Future Work

There is a lot that still needs to be improved, ranging from implementing more data structures and algorithms, making slight modifications to existing ones, bug fixing, updating the UI and making general improvements. Whatever your interest in web development is, you can probably improve your skills by contributing in that regard!

For more details on what needs to be done, check out the [Projects page](https://github.gatech.edu/rpontes3/visualization-tool/projects). What is outlined there is just to help guide development though, so feel free to contribute with whatever you think would be useful!
