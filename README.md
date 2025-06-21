# MyGlobe
MyGlobe is a JavaScript library which allows users to create a customized interactive 3D planet as a presentation of images. The 3D planet created can display images positioned on geographical coordinates.

## Features
So far, the software features achieved are:

  * Images markers: place miniature images on the 3D planet according to their geographical coordinates.
  * Interactive planet: manually rotate and zoom the planet in order to change the point of view and explore it freely.
  * Stars around the planet: place a custom number of stars around the planet, with different distances from the planet. 
  * Custom click callback: implement a custom callback function to handle click events on the images.

## Configuration
The planet can be easily configured using a json file. Here [my-globe-config.json](https://github.com/nicholasala/MyGlobe/blob/main/my-globe-config.json) the structure of the json used.

## Development
The project dependencies are managed using npm. [Http-server](https://www.npmjs.com/package/http-server) is needed as a global npm dependency. The commands for the development are:

 * `npm install` install project dependencies
 * `npm run build` build the library in the dist folder
 * `npm run build-[name-of-example]` build the selected example in the dist folder
 * `npm run dev` start the development server on localhost:8080

## Human written code
The source code of the library is written without using auto-generated code from artificial intelligence

## Demo
As a use case MyGlobe is used to create a representation of the paintings created by [Viento Mosse](https://www.vientomosse.art) in her World Painting Project. The click on the images in this case, shows a popup with the information of the painting. Here some screenshots from the first release of this use case:

<p align="center">
  <img src="https://github.com/nicholasala/MyGlobe/blob/main/use-case-img/use-case-example.png">
</p>

<p align="center">
  <img src="https://github.com/nicholasala/MyGlobe/blob/main/use-case-img/use-case-zoom.png">
</p>

<p align="center">
  <img src="https://github.com/nicholasala/MyGlobe/blob/main/use-case-img/use-case-customized-popup.png">
</p>
