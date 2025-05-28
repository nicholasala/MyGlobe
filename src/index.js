import { CANVAS_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS } from './constants';
import { ImageDTO } from './model/ImageDTO';
import { PlanetKeeper } from './PlanetKeeper';

window.onload = () => {
    const planetKeeper = new PlanetKeeper();
    planetKeeper.createPlanet(CANVAS_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS);
    planetKeeper.enableMouseControls();
    planetKeeper.enableZoomControls();
    planetKeeper.start();

    setTimeout(() => {
        const images = [
            new ImageDTO({width: 1284, height: 1590, url: '/demo/dipinto-carla.jpg', lat: 67.9587305, lon: 13.0037751}),
            new ImageDTO({width: 1433, height: 2001, url: '/demo/dipinto-carla-2.jpg', lat: -41.2887953, lon: 174.7772114}),
            new ImageDTO({width: 2001, height: 1215, url: '/demo/dipinto-carla-3.jpg', lat: 52.3730796, lon: 4.8924534}),
            new ImageDTO({width: 1343, height: 1601, url: '/demo/dipinto-carla-4.jpg', lat: 34.6829008, lon: 135.8545975})
        ]; 

        planetKeeper.addImagesOnPlanet(images);
    }, 1000);
};