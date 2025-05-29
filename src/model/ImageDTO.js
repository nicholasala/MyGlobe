export class ImageDTO{
    width;
    height;
    url;
    lat;
    lon;
    nation;

    constructor(image) {
        this.width = image.width;
        this.height = image.height;
        this.url = image.url;
        this.lat = image.lat;
        this.lon = image.lon;
        this.nation = image.nation;
    }
}