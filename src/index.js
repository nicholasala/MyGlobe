import { CANVAS_CONTAINER_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS } from './constants';
import { ImageDTO } from './model/ImageDTO';
import { PlanetKeeper } from './PlanetKeeper';

function hideLoader() {
    const loaderContainer = document.getElementById('loaderContainer');
    loaderContainer.style.display = 'none';
}

function showImagePopup(image) {
    const popupContainer = document.getElementById('popupContainer');
    const popupTitle = document.getElementById('popupTitle');
    const popupImage = document.getElementById('popupImage');

    if(image.description) {
        const popupDescription = document.getElementById('popupDescription');
        popupDescription.style.display = 'block';
        popupDescription.innerText = image.description;
    }

    popupTitle.innerText = image.nation;
    popupImage.src = image.url;
    popupContainer.style.display = 'flex';
    popupContainer.classList.add('appear-animation');
    setTimeout(() => popupContainer.classList.remove('appear-animation'), 800);
}

function hideImagePopup() {
    const popupContainer = document.getElementById('popupContainer');
    const popupDescription = document.getElementById('popupDescription');
    popupDescription.style.display = 'none';
    popupDescription.innerText = '';
    popupContainer.style.display = 'none';
}

function getImageClickCallback(image) {
    return () => showImagePopup(image);
}

function disableCanvasSelection() {
    const container = document.getElementById(CANVAS_CONTAINER_ELEMENT_ID);

    if(container.childElementCount > 0)
        container.children[0].classList.add('not-selectable');
}

window.onload = () => {
    const planetKeeper = new PlanetKeeper();
    planetKeeper.createPlanet(CANVAS_CONTAINER_ELEMENT_ID, SCENE_BACKGROUND_COLOR, TEXTURE_ADDRESS);
    planetKeeper.start();
    disableCanvasSelection();

    setTimeout(() => {
        const images = [
            new ImageDTO({width: 1284, height: 1590, url: '/demo/dipinto-carla.jpg', lat: 67.9587305, lon: 13.0037751, nation: 'Norway', description: 'Una descrizione'}),
            new ImageDTO({width: 1433, height: 2001, url: '/demo/dipinto-carla-2.jpg', lat: -41.2887953, lon: 174.7772114, nation: 'New Zeland', description: ''}),
            new ImageDTO({width: 2001, height: 1215, url: '/demo/dipinto-carla-3.jpg', lat: 52.3730796, lon: 4.8924534, nation: 'Netherlands', description: ''}),
            new ImageDTO({width: 1343, height: 1601, url: '/demo/dipinto-carla-4.jpg', lat: 34.6829008, lon: 135.8545975, nation: 'Japan', description: ''}),
            new ImageDTO({width: 1433, height: 2001, url: '/demo/dipinto-carla-5.jpg', lat: 36.7014631, lon: -118.755997, nation: 'California', description: ''}),
            new ImageDTO({width: 1313, height: 1829, url: '/demo/dipinto-carla-6.jpg', lat: 1.357107, lon: 103.8194992, nation: 'Singapore', description: ''}),
            new ImageDTO({width: 1141, height: 1969, url: '/demo/dipinto-carla-7.jpg', lat: -18.1239696, lon: 179.0122737, nation: 'Fiji islands', description: ''})
        ];

        planetKeeper.addImagesOnPlanet(images, getImageClickCallback).then(() => {
            planetKeeper.addStars(300, 50);
            planetKeeper.addStars(100, 32);
            planetKeeper.addStars(100, 28);
            planetKeeper.addStars(100, 30);
            planetKeeper.enableClickOnImages();
            planetKeeper.enableControls();
            hideLoader();
        });

        const closePopupIcon = document.getElementById('closeIcon');
        closePopupIcon.addEventListener('click', hideImagePopup);
    }, 2000);
};