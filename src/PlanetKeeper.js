import {
    Color,
    Mesh,
    MeshBasicMaterial,
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
    MAX_IMAGES_SPHERE_RADIUS_OFFSET,
    MIN_CAMERA_DISTANCE,
    MAX_CAMERA_DISTANCE,
    ZOOM_TRIGGER_DISTANCE,
    MAX_IMAGE_SIZE,
    MIN_IMAGE_SIZE,
    IMAGE_SIZE_CHANGE_FACTOR,
    MIN_IMAGES_SPHERE_RADIUS_OFFSET,
    IMAGES_SPHERE_RADIUS_CHANGE_FACTOR,
    MIN_POINT_LIGHT_INTENSITY,
    LIGHT_CHANGE_FACTOR,
    MAX_POINT_LIGHT_INTENSITY,
    POINTER_MOVE_OFFSET_TRIGGER
} from './constants';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class PlanetKeeper {
    #scene;
    #canvasContainerElement;
    #renderer;
    #camera;
    #planet;
    #rayCaster;
    #controls;
    #pointLight;
    #pointer = new Vector2();
    #onPointerMove = (event) => this.#onScenePointerMove(event);
    #prevPointerMoveX;
    #prevPointerMoveY;
    #onPointerUp = () => this.#onScenePointerUp();
    #imageClickCallback;
    #planetRadius = 0.5;
    #previousCameraDistance = MAX_CAMERA_DISTANCE;

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
        this.#pointLight = new PointLight(LIGHT_COLOR, MAX_POINT_LIGHT_INTENSITY);
        this.#pointLight.position.copy(this.#camera.position);
        this.#scene.add(this.#pointLight);

        //Window resize event
        window.addEventListener('resize', () => this.#renderer.setSize(this.#canvasContainerElement.clientWidth, this.#canvasContainerElement.clientHeight));
    }

    enableClickOnImages() {
        this.#canvasContainerElement.addEventListener('pointerdown', (event) => this.#onScenePointerDown(event));
    }

    enableControls() {
        this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement);
        this.#controls.minDistance = MIN_CAMERA_DISTANCE;
        this.#controls.maxDistance = MAX_CAMERA_DISTANCE;
        this.#controls.addEventListener('change', () => this.#onCameraChange());
    }

    enableRotation() {
        if(this.#controls) this.#controls.autoRotate = true;
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
        const material = new MeshBasicMaterial({map: new TextureLoader().load(image.min)});
        const planeSize = this.#getPlaneSize(image);
        const geometry = new PlaneGeometry(planeSize.width, planeSize.height);
        const mesh = new Mesh(geometry, material);
        mesh.onClick = onClick;
        mesh.lat = image.lat;
        mesh.lon = image.lon;
        this.#placeImageOnPlanet(mesh, image.lat, image.lon, MAX_IMAGES_SPHERE_RADIUS_OFFSET);
        this.#planet.add(mesh);
    }

    /**
     * Start the scene animation
     */
    start() {
        const animate = () => {
            if(this.#controls && this.#controls.autoRotate) this.#controls.update();
            this.#renderer.render(this.#scene, this.#camera);
            requestAnimationFrame(animate);
        }

        animate();
    }

    /**
     * Position an image on a planet.
     * @param {Object3D} image - the image to place
     * @param {number} lat - latitude of the location
     * @param {number} lon - longitude of the location
     * @param {number} radiusOffset - the sphere radius offset considering the planet radius and the radius of the sphere where the images are placed
     * source: https://stackoverflow.com/questions/46017167/how-to-place-marker-with-lat-lon-on-3d-globe-three-js
     */
    #placeImageOnPlanet(image, lat, lon, radiusOffset) {
        const latRad = lat * (Math.PI / 180);
        const lonRad = -lon * (Math.PI / 180);
        const radius = this.#planetRadius + radiusOffset;

        image.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * radius,
            Math.sin(latRad) * radius,
            Math.cos(latRad) * Math.sin(lonRad) * radius
        );
    }

    /**
     * Update the scene when the camera is moved
     */
    #onCameraChange() {
        this.#alignImagesOrientation();
        this.#alignLightPosition();
        const cameraDistance = this.#camera.position.distanceTo(this.#controls.target);

        if(Math.abs(cameraDistance - this.#previousCameraDistance) >= ZOOM_TRIGGER_DISTANCE) {
            this.#onZoom(cameraDistance);
            this.#previousCameraDistance = cameraDistance;
        }
    }

    /**
    * Handle the pointer down event in the scene preparing the callback related to an image
    * @param {Event} event - pointer down event
    */
    #onScenePointerDown(event) {
        if(this.#controls) this.#controls.autoRotate = false;
        const {top, left, width, height} = this.#renderer.domElement.getBoundingClientRect();
        this.#pointer.x = -1 + 2 * (event.clientX - left) / width;
        this.#pointer.y = 1 - 2 * (event.clientY - top) / height;
        this.#rayCaster.setFromCamera(this.#pointer, this.#camera);
        const intersections = this.#rayCaster.intersectObjects(this.#planet.children, false);

        if(intersections.length > 0){
            const planetIntersection = this.#rayCaster.intersectObject(this.#planet, false);

            if(planetIntersection.length > 0 && planetIntersection[0].distance < intersections[0].distance)
                return;

            this.#imageClickCallback = intersections[0].object.onClick;
            this.#prevPointerMoveX = event.clientX;
            this.#prevPointerMoveY = event.clientY;
            this.#canvasContainerElement.addEventListener('pointermove', this.#onPointerMove);
            this.#canvasContainerElement.addEventListener('pointerup', this.#onPointerUp);
        }
    }

    /**
    * Handle the pointer move event in the scene
    */
    #onScenePointerMove(event) {
        if(Math.abs(this.#prevPointerMoveX - event.clientX) > POINTER_MOVE_OFFSET_TRIGGER ||
            Math.abs(this.#prevPointerMoveY - event.clientY) > POINTER_MOVE_OFFSET_TRIGGER)
            this.#clearImageClick();
    }

    /**
    * Handle the pointer up event in the scene calling the callback related to an image if an image was clicked
    */
    #onScenePointerUp() {
        this.#imageClickCallback();
        this.#clearImageClick();
    }

    /**
    * Clear the click on the image callbacks
    */
    #clearImageClick() {
        this.#imageClickCallback = undefined;
        this.#canvasContainerElement.removeEventListener('pointermove', this.#onPointerMove);
        this.#canvasContainerElement.removeEventListener('pointerup', this.#onPointerUp);
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
     * Align the position of the light with the position of the camera
     */
    #alignLightPosition() {
        this.#pointLight.position.copy(this.#camera.position);
    }

    /**
    * Adjust the scene (light intensity, images size, images position) on zoom
    * @param {number} cameraDistance - distance of the camera from the scene
    */
    #onZoom(cameraDistance) {
        let zoomPosition = Math.trunc((cameraDistance - MIN_CAMERA_DISTANCE) / ZOOM_TRIGGER_DISTANCE);
        if(zoomPosition < 0) zoomPosition = 0;

        this.#pointLight.intensity = MIN_POINT_LIGHT_INTENSITY + (LIGHT_CHANGE_FACTOR * zoomPosition);
        const actualImageMaxSize = MIN_IMAGE_SIZE + (IMAGE_SIZE_CHANGE_FACTOR * zoomPosition);
        const imageScale = ((actualImageMaxSize * 100) / MAX_IMAGE_SIZE) / 100;
        const imageSphereRadiusOffset = MIN_IMAGES_SPHERE_RADIUS_OFFSET + (IMAGES_SPHERE_RADIUS_CHANGE_FACTOR * zoomPosition);

        this.#planet.children.forEach(image => {
            image.scale.x = imageScale;
            image.scale.y = imageScale;
            image.scale.z = imageScale;
            this.#placeImageOnPlanet(image, image.lat, image.lon, imageSphereRadiusOffset);
        });
    }

    /**
    * Get the plane size based on the image aspect ratio
    * @param {ImageDTO} image - image object
    */
    #getPlaneSize(image) {
        if(image.height >= image.width) {
            return {
                height: MAX_IMAGE_SIZE,
                width: MAX_IMAGE_SIZE * (((image.width * 100) / image.height) / 100)
            }
        } else {
            return {
                height: MAX_IMAGE_SIZE * (((image.height * 100) / image.width) / 100),
                width: MAX_IMAGE_SIZE
            }
        }
    }
}