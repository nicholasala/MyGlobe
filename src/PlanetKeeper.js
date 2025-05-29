import {
    AmbientLight,
    Color,
    MathUtils,
    Mesh,
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
    Vector3,
    WebGLRenderer
} from 'three';
import {
    AMBIENT_LIGHT_INTENSITY,
    EARTH_ROTATION_ANGLE_RADIANS,
    LIGHT_COLOR,
    MESH_COLOR,
    POINT_LIGHT_INTENSITY,
    X_AXIS_SHIFT_LIMIT,
    AXIS_ROTATION_RAD_DIVIDER,
    IMAGES_Y_OFFSET
} from './constants';

const xAxisVector = new Vector3(1, 0, 0);
const yAxisVector = new Vector3(0, 1, 0);

export class PlanetKeeper {
    #scene;
    #canvasElement;
    #renderer;
    #camera;
    #planet;
    #rayCaster;
    #pointer = new Vector2();
    #isRotating = false;
    #planetRadius = 0.5;
    #previousClientX = 0;
    #previousClientY = 0;
    #xShiftRadTotal = 0;

    createPlanet(canvasElementId, sceneBackgroundColor, textureAddress) {
        //Scene
        this.#scene = new Scene();
        this.#canvasElement = document.getElementById(canvasElementId);
        this.#renderer = new WebGLRenderer({ canvas: this.#canvasElement });
        this.#camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.4, 1000);
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        this.#camera.position.z = 1.7;
        this.#scene.background = new Color(sceneBackgroundColor);
        this.#rayCaster = new Raycaster();

        //Planet
        const earthGeometry = new SphereGeometry(this.#planetRadius, 32, 32);
        const earthMaterial = new MeshPhongMaterial({color: MESH_COLOR, map: new TextureLoader().load(textureAddress)});
        this.#planet = new Mesh(earthGeometry, earthMaterial);
        this.#scene.add(this.#planet);

        //Light
        this.#scene.add(new AmbientLight(LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY));
        const pointLight = new PointLight(LIGHT_COLOR, POINT_LIGHT_INTENSITY);
        pointLight.position.set(-5, 0, 5);
        this.#scene.add(pointLight);
    }

    enablePointerControls() {
        const onDrag = (event) => this.#onPlanetDrag(event);

        this.#canvasElement.addEventListener('pointerdown', (event) => {
            this.#isRotating = false;
            this.#pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	        this.#pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            this.#rayCaster.setFromCamera(this.#pointer, this.#camera);
            const intersections = this.#rayCaster.intersectObjects(this.#planet.children);

            if(intersections.length > 0) {
                intersections[0].object.onClick();
            } else {
                this.#previousClientX = event.clientX;
                this.#previousClientY = event.clientY;
                this.#canvasElement.addEventListener('pointermove', onDrag);
            }
        });

        this.#canvasElement.addEventListener('pointerup', () => this.#canvasElement.removeEventListener('pointermove', onDrag));
    }

    enableZoomControls() {
        // TODO
        // this.#onPlanetZoom()
    }

    start() {
        const render = () => {
            this.#renderer.render(this.#scene, this.#camera);
        }

        const update = () => {
            this.#planet.rotateOnWorldAxis(yAxisVector, EARTH_ROTATION_ANGLE_RADIANS);
            this.#alignImagesOrientation();
        }

        const animate = () => {
            render();
            if(this.#isRotating) update();
            requestAnimationFrame(animate);
        }

        animate();
    }

    enableRotation() {
        this.#isRotating = true;
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

    #onPlanetDrag(event) {
        const xAxisShiftRad = MathUtils.degToRad((event.clientY - this.#previousClientY));
        const yAxisShiftRad = MathUtils.degToRad((event.clientX - this.#previousClientX));
        this.#rotateOnX(xAxisShiftRad);
        this.#rotateOnY(yAxisShiftRad);
        this.#alignImagesOrientation();
        this.#previousClientX = event.clientX;
        this.#previousClientY = event.clientY;
    }

    /**
    * Rotate planet on x axis
    * @param {number} shift - shift of the rotation in radians
    */
    #rotateOnX(shift) {
        this.#xShiftRadTotal += shift;

        if(Math.abs(this.#xShiftRadTotal) < X_AXIS_SHIFT_LIMIT) {
            this.#planet.rotateOnWorldAxis(xAxisVector, shift / AXIS_ROTATION_RAD_DIVIDER);
        }
        else {
            this.#xShiftRadTotal = this.#xShiftRadTotal > 0 ? X_AXIS_SHIFT_LIMIT : -X_AXIS_SHIFT_LIMIT;
        }
    }

    /**
    * Rotate planet on y axis
    * @param {number} shift - shift of the rotation in radians
    */
    #rotateOnY(shift) {
        this.#planet.rotateOnWorldAxis(yAxisVector, shift / AXIS_ROTATION_RAD_DIVIDER);
    }

    #onPlanetZoom() {
        //TODO
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
        const yOffset = lat >= 0 ? IMAGES_Y_OFFSET : - IMAGES_Y_OFFSET;

        image.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * radius,
            Math.sin(latRad) * radius + yOffset,
            Math.cos(latRad) * Math.sin(lonRad) * radius
        );
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