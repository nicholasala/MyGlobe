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
    const popupDescription = document.getElementById('popupDescription');
    const buttonsContainer = document.getElementById('buttonsContainer');
    popupTitle.innerText = image.nation;
    popupImage.src = image.url;
    popupDescription.style.display = 'none';
    popupDescription.innerText = '';
    buttonsContainer.innerHTML = '';

    if(image.description) {
        popupDescription.style.display = 'block';
        popupDescription.innerText = image.description;
    }

    if(image.actions && image.actions.length > 0) {
        buttonsContainer.innerHTML = image.actions.reduce((html, action) => {
            return `${html}<a href="${action.url}" class="popup-button-link"><div class="popup-button">${action.text}</div></a>`
        }, '');
    }

    popupContainer.style.display = 'flex';
    popupContainer.classList.add('appear-animation');
    setTimeout(() => popupContainer.classList.remove('appear-animation'), 800);
}

function hideImagePopup() {
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.display = 'none';
}

function getImageClickCallback(image) {
    return () => showImagePopup(image);
}

function disableCanvasSelection(containerId) {
    const container = document.getElementById(containerId);

    if(container.childElementCount > 0)
        container.children[0].classList.add('not-selectable');
}

window.onload = () => {
    fetch('/my-globe-config.json')
        .then(res => res.json())
        .then(config => {
            const planetKeeper = new PlanetKeeper();
            planetKeeper.createPlanet(config.canvasContainerId, Number(config.sceneBackgroundColor), config.texture);
            planetKeeper.start();
            if(config.primaryColor) document.documentElement.style.setProperty('--primary-color', config.primaryColor)
            disableCanvasSelection(config.canvasContainerId);

            setTimeout(() => {
                const images = config.images.map(image => new ImageDTO(image));
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
        });
};