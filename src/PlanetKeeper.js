import {
    Color,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    Raycaster,
    Scene,
    SphereGeometry,
    TextureLoader,
    Vector2,
    WebGLRenderer
} from 'three';
import {
    LIGHT_COLOR,
    MESH_COLOR,
    POINT_LIGHT_INTENSITY,
    IMAGES_Y_OFFSET
} from './constants';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class PlanetKeeper {
    #scene;
    #canvasContainerElement;
    #renderer;
    #camera;
    #planet;
    #pointLight;
    #rayCaster;
    #controls;
    #pointer = new Vector2();
    #planetRadius = 0.5;

    /**
    * Create the planet in the scene
    * @param {String} canvasContainerElementId - id of container element of the scene
    * @param {Hexadecimal color} sceneBackgroundColor - color of the background of the scene
    * @param {String} textureAddress - address of the planet texture
    */
    createPlanet(canvasContainerElementId, sceneBackgroundColor, textureAddress) {
        //Scene
        this.#scene = new Scene();
        this.#scene.background = new Color(sceneBackgroundColor);
        this.#canvasContainerElement = document.getElementById(canvasContainerElementId);
        this.#renderer = new WebGLRenderer({antialias: true});
        this.#renderer.setSize(this.#canvasContainerElement.clientWidth, this.#canvasContainerElement.clientHeight);
        this.#canvasContainerElement.appendChild(this.#renderer.domElement);
        this.#camera = new PerspectiveCamera(30, this.#canvasContainerElement.clientWidth / this.#canvasContainerElement.clientHeight);
        this.#camera.position.x = -0.78;
        this.#camera.position.z = -2.84;
        this.#camera.lookAt(this.#scene.position);
        this.#rayCaster = new Raycaster();

        //Planet
        const earthGeometry = new SphereGeometry(this.#planetRadius, 32, 32);
        const earthMaterial = new MeshPhongMaterial({color: MESH_COLOR, map: new TextureLoader().load(textureAddress)});
        this.#planet = new Mesh(earthGeometry, earthMaterial);
        this.#scene.add(this.#planet);

        //Light
        this.#pointLight = new PointLight(LIGHT_COLOR, POINT_LIGHT_INTENSITY);
        this.#scene.add(this.#pointLight);

        //Window resize event
        window.addEventListener('resize', () => this.#renderer.setSize(this.#canvasContainerElement.clientWidth, this.#canvasContainerElement.clientHeight));
    }

    enableClickOnImages() {
        this.#canvasContainerElement.addEventListener('pointerdown', (event) => {
            if(this.#controls) this.#controls.autoRotate = false;
            const {top, left, width, height} = this.#renderer.domElement.getBoundingClientRect();
            this.#pointer.x = -1 + 2 * (event.clientX - left) / width;
	        this.#pointer.y = 1 - 2 * (event.clientY - top) / height;
            this.#rayCaster.setFromCamera(this.#pointer, this.#camera);
            const intersections = this.#rayCaster.intersectObjects(this.#planet.children);

            if(intersections.length > 0)
                intersections[0].object.onClick();
        });
    }

    enableControls() {
        this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
        this.#controls.enableZoom = false;
        this.#controls.autoRotate = true;
    }

    /**
    * Randomly place stars on a sphere around the planet
    * @param {number} starsCount - number of stars to place
    * @param {number} starsDistance - radius of the sphere, positioned around the planet, where the stars will be placed
    * Sphere with center in the origin equation: x2 + y2 + z2 = r2
    */
    addStars(starsCount, starsDistance) {
        const starGeometry = new SphereGeometry(0.05, 4, 4);
        const starMaterial = new MeshBasicMaterial();

        for(let i = 0; i < starsCount; i++) {
            const star = new Mesh(starGeometry, starMaterial);
            const randomX = Math.sqrt(Math.random() * (starsDistance * starsDistance));
            const randomY = Math.sqrt(Math.random() * (starsDistance * starsDistance - randomX * randomX));
            const randomZ = Math.sqrt(Math.random() * (starsDistance * starsDistance - (randomX * randomX + randomY * randomY)));
            star.position.x = Math.random() > 0.5 ? randomX : -randomX;
            star.position.y = Math.random() > 0.5 ? randomY : -randomY;
            star.position.z = Math.random() > 0.5 ? randomZ : -randomZ;
            this.#scene.add(star);
        }
    }

    start() {
        const animate = () => {
            if(this.#controls) {
                if(this.#controls.autoRotate) this.#controls.update();
                this.#alignLightPosition();
                this.#alignImagesOrientation();
            }

            this.#renderer.render(this.#scene, this.#camera);
            requestAnimationFrame(animate);
        }

        animate();
    }

    /**
    * Add a list of images on the planet
    * @param {ImageDTO[]} images - image object
    * @param {Function} getClickCallback - function that accepts an image and return the on click callback associated
    */
    async addImagesOnPlanet(images, getClickCallback) {
        for(const image of images) {
            this.addImageOnPlanet(image, getClickCallback(image));
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    /**
    * Add an image to the planet
    * @param {ImageDTO} image - image object
    * @param {Function} onClick - on click callback
    */
    addImageOnPlanet(image, onClick) {
        const material = new MeshLambertMaterial({map: new TextureLoader().load(image.url)});
        const planeSize = this.#getPlaneSize(image);
        const geometry = new PlaneGeometry(planeSize.width, planeSize.height);
        const mesh = new Mesh(geometry, material);
        mesh.onClick = onClick;
        this.#placeImageOnPlanet(mesh, image.lat, image.lon, this.#planetRadius);
        this.#planet.add(mesh);
    }

    /**
     * Position an image on a planet.
     * @param {Object3D} image - the image to place
     * @param {number} lat - latitude of the location
     * @param {number} lon - longitude of the location
     * @param {number} radius - radius of the planet
     * source: https://stackoverflow.com/questions/46017167/how-to-place-marker-with-lat-lon-on-3d-globe-three-js
     */
    #placeImageOnPlanet(image, lat, lon, radius) {
        const latRad = lat * (Math.PI / 180);
        const lonRad = -lon * (Math.PI / 180);

        image.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * radius,
            Math.sin(latRad) * radius + this.#getImageYOffset(lat),
            Math.cos(latRad) * Math.sin(lonRad) * radius
        );
    }

    /**
     * Get the y offset of an image in order to make it completely visible (outside the sphere)
     * @param {number} lat - latitude of the image
     */
    #getImageYOffset(lat) {
        const signFactor = lat >= 0 ? 1 : -1;
        const offsetFactor = Math.abs(lat) > 30 ? 1 : Math.abs(lat) > 10 ? 1.5 : 2;
        return IMAGES_Y_OFFSET * offsetFactor * signFactor;
    }

    /**
     * Make the images parallel to the camera plane
     */
    #alignImagesOrientation() {
        this.#planet.children.forEach(image => {
            image.lookAt(this.#camera.position);
        });
    }

    /**
     * Set the position of the light as the position of the camera
     */
    #alignLightPosition() {
        this.#pointLight.position.copy(this.#camera.position);
    }

    /**
    * Get the plane size based on the image aspect ratio
    * @param {ImageDTO} image - image object
    */
    #getPlaneSize(image) {
        const maxSize = 0.15;

        if(image.height >= image.width) {
            return {
                height: maxSize,
                width: maxSize * (((image.width * 100) / image.height) / 100)
            }
        } else {
            return {
                height: maxSize * (((image.height * 100) / image.width) / 100),
                width: maxSize
            }
        }
    }
}