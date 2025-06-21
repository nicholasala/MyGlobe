import { ImageDTO } from '../../src/model/ImageDTO';
import { PlanetKeeper } from '../../src/PlanetKeeper';

const popupAnimationDuration = 800;

function hideLoader() {
    const loaderContainer = document.getElementById('loaderContainer');
    loaderContainer.style.display = 'none';
}

function showProjectDescriptionPopup() {
    const popupContainer = document.getElementById('descriptionPopupContainer');
    popupContainer.style.display = 'flex';
    popupContainer.classList.add('appear-animation');
    setTimeout(() => popupContainer.classList.remove('appear-animation'), popupAnimationDuration);
}

function hideProjectDescriptionPopup() {
    const popupContainer = document.getElementById('descriptionPopupContainer');
    popupContainer.style.display = 'none';
}

function showImagePopup(image) {
    const popupContainer = document.getElementById('popupContainer');
    const popupTitle = document.getElementById('popupTitle');
    const popupImageContainer = document.getElementById('popupImageContainer');
    const popupDescription = document.getElementById('popupDescription');
    const buttonsContainer = document.getElementById('buttonsContainer');
    popupTitle.innerText = image.nation;
    popupImageContainer.style.backgroundImage = `url("${image.url}")`;
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
    setTimeout(() => {
        popupContainer.classList.remove('appear-animation');
        const popupImageLoaderContainer = document.getElementById('popupImageLoaderContainer');
        if(popupImageLoaderContainer) popupImageLoaderContainer.style.display = 'none';
    }, popupAnimationDuration);
}

function hideImagePopup() {
    const popupContainer = document.getElementById('popupContainer');
    const popupImageLoaderContainer = document.getElementById('popupImageLoaderContainer');
    const popupImageContainer = document.getElementById('popupImageContainer');
    if(popupContainer) popupContainer.style.display = 'none';
    if(popupImageLoaderContainer) popupImageLoaderContainer.style.display = 'flex';
    if(popupImageContainer) popupImageContainer.style.backgroundImage = '';
}

function getImageClickCallback(image) {
    return () => showImagePopup(image);
}

function showSupportWays() {
    const supportButton = document.getElementById('supportButton');
    const paypalButton = document.getElementById('paypalButton');
    const wiseButton = document.getElementById('wiseButton');
    supportButton.style.display = 'none';
    paypalButton.style.display = 'block';
    wiseButton.style.display = 'block';
}

function prepareDomEvents() {
    const headerSubtitle = document.getElementById('headerSubtitle');
    const closePopupIcon = document.getElementById('closeIcon');
    const closeProjectDescriptionIcon = document.getElementById('closeProjectDescriptionIcon');
    const supportButton = document.getElementById('supportButton');

    if(headerSubtitle) headerSubtitle.addEventListener('click', showProjectDescriptionPopup);
    if(closePopupIcon) closePopupIcon.addEventListener('click', hideImagePopup);
    if(closeProjectDescriptionIcon) closeProjectDescriptionIcon.addEventListener('click', hideProjectDescriptionPopup);
    if(supportButton) supportButton.addEventListener('click', showSupportWays);
}

window.onload = () => {
    const configPath = document.body.dataset.myGlobeConfig ? document.body.dataset.myGlobeConfig : '/my-globe-config.json';

    fetch(configPath)
        .then(res => res.json())
        .then(config => {
            if(config.primaryColor) document.documentElement.style.setProperty('--primary-color', config.primaryColor);

            const planetKeeper = new PlanetKeeper();
            const images = config.images.map(image => new ImageDTO(image));
            planetKeeper.createPlanet(config.canvasContainerId, Number(config.sceneBackgroundColor), config.texture);
            planetKeeper.start();
            prepareDomEvents();

            planetKeeper.addImagesOnPlanet(images, getImageClickCallback).then(() => {
                planetKeeper.addStars(300, 50);
                planetKeeper.addStars(100, 32);
                planetKeeper.addStars(100, 28);
                planetKeeper.addStars(100, 30);
                planetKeeper.enableClickOnImages();
                planetKeeper.enableControls();
                planetKeeper.enableAutoRotation();
                setTimeout(hideLoader, 2000);
            });
        });
};