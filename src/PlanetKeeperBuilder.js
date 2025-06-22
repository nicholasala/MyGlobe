import { ConfigDTO } from './model/ConfigDTO';
import { PlanetKeeper } from './PlanetKeeper';

export class PlanetKeeperBuilder {
    config;
    getImageClickCallback;

    /**
    * Constructor of the parser
    * @param {ConfigDTO} config - dto of the configuration
    * @param {Function} getImageClickCallback - function that accepts an ImageDTO and return the on click callback associated
    */
    constructor(config, getImageClickCallback) {
        this.config = config;
        this.getImageClickCallback = getImageClickCallback;
    }

    /**
     * Create the planet keeper from the given configuration 
     */
    async build() {
        const planetKeeper = new PlanetKeeper();
        planetKeeper.createPlanet(this.config.canvasContainerId, Number(this.config.sceneBackgroundColor), this.config.texture);
        await planetKeeper.addImagesOnPlanet(this.config.images, this.getImageClickCallback);
        return planetKeeper;
    }
}