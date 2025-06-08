export class ImageDTO{
    width;
    height;
    url;
    min;
    lat;
    lon;
    nation;
    description;
    actions;

    constructor(image) {
        this.width = image.width;
        this.height = image.height;
        this.url = image.url;
        this.min = image.min;
        this.lat = image.lat;
        this.lon = image.lon;
        this.nation = image.nation;
        this.description = image.description;
        this.actions = image.actions;
    }
}