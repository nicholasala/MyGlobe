export class ImageDTO{
    width;
    height;
    url;
    lat;
    lon;

    constructor(image) {
        this.width = image.width;
        this.height = image.height;
        this.url = image.url;
        this.lat = image.lat;
        this.lon = image.lon;
    }
}