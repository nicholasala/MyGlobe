import {
    AmbientLight,
    Color,
    MathUtils,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereGeometry,
    TextureLoader,
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
    X_AXIS_FIRST_THRESHOLD,
    X_AXIS_SECOND_THRESHOLD,
    Y_AXIS_SHIFT_LIMIT,
    AXIS_ROTATION_RAD_DIVIDER
} from './constants';

const xAxisVector = new Vector3(1, 0, 0);
const yAxisVector = new Vector3(0, 1, 0);

export class PlanetKeeper {
    #scene;
    #canvasElement;
    #renderer;
    #camera;
    #planet;
    #isRotating = true;
    #previousClientX = 0;
    #previousClientY = 0;
    #xShiftRadTotal = 0;
    #yShiftRadTotal = 0;

    createPlanet(canvasElementId, sceneBackgroundColor, textureAddress) {
        //Scene
        this.#scene = new Scene();
        this.#canvasElement = document.getElementById(canvasElementId);
        this.#renderer = new WebGLRenderer({ canvas: this.#canvasElement });
        this.#camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.4, 1000);
        this.#renderer.setSize(window.innerWidth, window.innerHeight);
        this.#camera.position.z = 1.7;
        this.#scene.background = new Color(sceneBackgroundColor);

        //Planet
        const earthGeometry = new SphereGeometry(0.5, 32, 32);
        const earthMaterial = new MeshPhongMaterial({color: MESH_COLOR, map: new TextureLoader().load(textureAddress)});
        this.#planet = new Mesh(earthGeometry, earthMaterial);
        this.#scene.add(this.#planet);

        //Light
        this.#scene.add(new AmbientLight(LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY));
        const pointLight = new PointLight(LIGHT_COLOR, POINT_LIGHT_INTENSITY);
        pointLight.position.set(-5, 0, 5);
        this.#scene.add(pointLight);
    }

    enableMouseControls() {
        const onDrag = (event) => this.#onPlanetDrag(event);

        this.#canvasElement.addEventListener('mousedown', (event) => {
            this.#isRotating = false;
            this.#previousClientX = event.clientX;
            this.#previousClientY = event.clientY;
            this.#canvasElement.addEventListener('mousemove', onDrag);
        });

        this.#canvasElement.addEventListener('mouseup', () => this.#canvasElement.removeEventListener('mousemove', onDrag));
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
        }

        const animate = () => {
            render();
            if(this.#isRotating) update();
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    #onPlanetDrag(event) {
        const xAxisShiftRad = MathUtils.degToRad((event.clientY - this.#previousClientY));
        const yAxisShiftRad = MathUtils.degToRad((event.clientX - this.#previousClientX));

        if(Math.abs(xAxisShiftRad) > Math.abs(yAxisShiftRad)) {
            this.#rotateOnX(xAxisShiftRad);
        } else {
            this.#rotateOnY(yAxisShiftRad);
        }

        this.#previousClientX = event.clientX;
        this.#previousClientY = event.clientY;
    }

    /**
    * Rotate planet on x axis
    * @param {shift} shift of the rotation in radians
    */
    #rotateOnX(shift) {
        this.#xShiftRadTotal += shift;

        //Rotation on x axis
        if(Math.abs(this.#xShiftRadTotal) < X_AXIS_SHIFT_LIMIT) {
            this.#planet.rotateOnWorldAxis(xAxisVector, shift / AXIS_ROTATION_RAD_DIVIDER);
        }
        else {
            this.#xShiftRadTotal = this.#xShiftRadTotal > 0 ? X_AXIS_SHIFT_LIMIT : -X_AXIS_SHIFT_LIMIT;
        }
    }

    /**
    * Rotate planet on y axis
    * @param {shift} shift of the rotation in radians
    */
    #rotateOnY(shift) {
        this.#yShiftRadTotal += shift;
        const absXShiftRadTotal = Math.abs(this.#xShiftRadTotal);
        const absYShiftRadTotal = Math.abs(this.#yShiftRadTotal);

        //Rotation on y axis
        if(absXShiftRadTotal < X_AXIS_FIRST_THRESHOLD) {
            this.#planet.rotateOnWorldAxis(yAxisVector, shift / AXIS_ROTATION_RAD_DIVIDER);
            this.#yShiftRadTotal = 0;
        } else if(absXShiftRadTotal < X_AXIS_SECOND_THRESHOLD && absYShiftRadTotal < Y_AXIS_SHIFT_LIMIT) {
            this.#planet.rotateOnWorldAxis(yAxisVector, shift / AXIS_ROTATION_RAD_DIVIDER);
        }
        else {
            if(absYShiftRadTotal >= Y_AXIS_SHIFT_LIMIT)
                this.#yShiftRadTotal = this.#yShiftRadTotal > 0 ? Y_AXIS_SHIFT_LIMIT : -Y_AXIS_SHIFT_LIMIT;
            else
                this.#yShiftRadTotal = 0;
        }
    }

    #onPlanetZoom() {
        //TODO
    }
}