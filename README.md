# MyGlobe
MyGlobe is a JavaScript library built using Three.js that allows users to create a customized interactive 3D planet. This planet can display miniature photos based on geographical coordinates, enabling a unique way to visualize images in a spatial context. Users can manually rotate the planet and zoom in for a closer look.

## Features
So far, the software features achieved are:

  * Interactive 3D planet: rotate and zoom in on a 3D representation of a planet.
  * Photo Markers: place miniature photos on the planet according to their geographical coordinates.
  * Stars around the planet: place a custom number of stars around the planet, with different distances from the planet. 
  * Custom Click Callback: implement a custom callback function to handle click events on the images.

## Configuration
The planet can be easily configured using a json file. Here [my-globe-config.json](https://github.com/nicholasala/MyGlobe/blob/main/my-globe-config.json) the structure of the json used.

## Development
The project dependencies are managed using npm. [Http-server](https://www.npmjs.com/package/http-server) is needed as a global npm dependency. The commands for the development are:

 * `npm install` install project dependencies
 * `npm run build` build the project in the dist folder
 * `npm run dev` start the development server on localhost:8080

## Use case
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
