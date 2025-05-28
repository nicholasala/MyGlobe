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
    Y_AXIS_SHIFT_LIMIT
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
    #xAxisShiftRadTotal = 0;
    #yAxisShiftRadTotal = 0;

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
        //TODO
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
        const yAxisShiftRad = MathUtils.degToRad((event.clientX - this.#previousClientX));
        const xAxisShiftRad = MathUtils.degToRad((event.clientY - this.#previousClientY));
        this.#xAxisShiftRadTotal += xAxisShiftRad;
        this.#yAxisShiftRadTotal += yAxisShiftRad;
        const absXAxisShiftRadTotal = Math.abs(this.#xAxisShiftRadTotal);
        const absYAxisShiftRadTotal = Math.abs(this.#yAxisShiftRadTotal);

        //Rotation on x axis
        if(absXAxisShiftRadTotal < X_AXIS_SHIFT_LIMIT) {
            this.#planet.rotateOnWorldAxis(xAxisVector, xAxisShiftRad / 5);
        }
        else {
            this.#xAxisShiftRadTotal = this.#xAxisShiftRadTotal > 0 ? X_AXIS_SHIFT_LIMIT : -X_AXIS_SHIFT_LIMIT;
        }

        //Rotation on y axis
        if(absXAxisShiftRadTotal < X_AXIS_FIRST_THRESHOLD) {
            this.#planet.rotateOnWorldAxis(yAxisVector, yAxisShiftRad / 5);
            this.#yAxisShiftRadTotal = 0;
        } else if(absXAxisShiftRadTotal < X_AXIS_SECOND_THRESHOLD && absYAxisShiftRadTotal < Y_AXIS_SHIFT_LIMIT) {
            this.#planet.rotateOnWorldAxis(yAxisVector, yAxisShiftRad / 5);
        }
        else {
            this.#yAxisShiftRadTotal = this.#yAxisShiftRadTotal > 0 ? Y_AXIS_SHIFT_LIMIT : -Y_AXIS_SHIFT_LIMIT;
        }

        this.#previousClientX = event.clientX;
        this.#previousClientY = event.clientY;
    }

    #onPlanetZoom() {
        //TODO
    }
}