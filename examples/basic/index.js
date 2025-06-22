import { PlanetKeeperBuilder } from '../../src/PlanetKeeperBuilder'

function getImageClickCallback(image) {
    return () => console.log('Image clicked');
}

window.onload = () => {
    fetch('/my-globe-config.json')
        .then(res => res.json())
        .then(config => {
            const builder = new PlanetKeeperBuilder(config, getImageClickCallback);

            builder.build().then(planetKeeper => {
                planetKeeper.enableControls();
                planetKeeper.enableAutoRotation();
                planetKeeper.enableClickOnImages();
                planetKeeper.addStars(300, 50);
                planetKeeper.start();
            });
        });
}