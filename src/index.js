import { CANVAS_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS } from './constants';
import { PlanetKeeper } from './PlanetKeeper';

window.onload = () => {
    const planetKeeper = new PlanetKeeper();

    planetKeeper.createPlanet(CANVAS_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS);
    planetKeeper.enableMouseControls();
    planetKeeper.enableZoomControls();
    planetKeeper.start();
};