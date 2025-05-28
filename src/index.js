import { CANVAS_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS } from './constants';
import { PlanetKeeper } from './PlanetKeeper';

window.onload = () => {
    const planetKeeper = new PlanetKeeper();

    planetKeeper.createPlanet(CANVAS_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS);
    planetKeeper.enableMouseControls();
    planetKeeper.enableZoomControls();
    planetKeeper.start();

    setTimeout(() => {
        planetKeeper.addImageOnPlanet('/demo/dipinto-carla.jpg', 67.9587305, 13.0037751);
    }, 1000);
};