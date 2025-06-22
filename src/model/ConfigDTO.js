import { ImageDTO } from './ImageDTO';

export class ConfigDTO{
    texture;
    canvasContainerId;
    sceneBackgroundColor;
    images;

    constructor(config) {
        this.texture = config.texture;
        this.canvasContainerId = config.canvasContainerId;
        this.sceneBackgroundColor = config.sceneBackgroundColor;
        this.images = config.images.map(image => new ImageDTO(image));
    }
}