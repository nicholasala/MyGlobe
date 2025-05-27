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
    GLOBE_ELEMENT_ID,
    LIGHT_COLOR,
    MESH_COLOR,
    POINT_LIGHT_INTENSITY,
    SCENE_BACKGROUND_COLOR,
    TEXTURE_ADDRESS,
    X_AXIS_SHIFT_LIMIT,
    X_AXIS_FIRST_THRESHOLD,
    X_AXIS_SECOND_THRESHOLD,
    Y_AXIS_SHIFT_LIMIT
} from './constants';

function createEarth() {
    let isRotating = true;
    let previousClientX = 0;
    let previousClientY = 0;
    let xAxisShiftRadTotal = 0;
    let yAxisShiftRadTotal = 0;
    const xAxisVector = new Vector3(1, 0, 0);
    const yAxisVector = new Vector3(0, 1, 0);

    //Scene
    const scene = new Scene();
    const globeElement = document.getElementById(GLOBE_ELEMENT_ID);
    const renderer = new WebGLRenderer({ canvas: globeElement });
    const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.4, 1000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 1.7;
    scene.background = new Color(SCENE_BACKGROUND_COLOR);

    //Earth
    const earthGeometry = new SphereGeometry(0.5, 32, 32);
    const earthMaterial = new MeshPhongMaterial({
        color: MESH_COLOR,
        map: new TextureLoader().load(TEXTURE_ADDRESS),
    });
    const earth = new Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    //Light
    scene.add(new AmbientLight(LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY));
    const pointLight = new PointLight(LIGHT_COLOR, POINT_LIGHT_INTENSITY);
    pointLight.position.set(-5, 0, 5);
    scene.add(pointLight);

    const render = () => {
        renderer.render(scene, camera);
    }

    const update = () => {
        earth.rotateOnWorldAxis(yAxisVector, EARTH_ROTATION_ANGLE_RADIANS);
    }

    const animate = () => {
        render();
        if(isRotating) update();
        requestAnimationFrame(animate);
    }

    //Mouse events
    //Rotation on x axis:
    //  1. Free when below X_AXIS_SHIFT_LIMIT
    //  2. Blocked when over X_AXIS_SHIFT_LIMIT
    //Rotation on y axis:
    //  1. Free when the rotation on the x axis is below X_AXIS_FIRST_THRESHOLD
    //  2. Limited to Y_AXIS_SHIFT_LIMIT when the rotation on the x axis is below X_AXIS_SECOND_THRESHOLD
    //  3. Blocked when the rotation on the x axis is over X_AXIS_SECOND_THRESHOLD
    const onMouseMove = (event) => {
        const yAxisShiftRad = MathUtils.degToRad((event.clientX - previousClientX));
        const xAxisShiftRad = MathUtils.degToRad((event.clientY - previousClientY));
        xAxisShiftRadTotal += xAxisShiftRad;
        yAxisShiftRadTotal += yAxisShiftRad;
        const absXAxisShiftRadTotal = Math.abs(xAxisShiftRadTotal);
        const absYAxisShiftRadTotal = Math.abs(yAxisShiftRadTotal);

        if(absXAxisShiftRadTotal < X_AXIS_SHIFT_LIMIT) {
            earth.rotateOnWorldAxis(xAxisVector, xAxisShiftRad / 5);
        }
        else {
            xAxisShiftRadTotal = xAxisShiftRadTotal > 0 ? X_AXIS_SHIFT_LIMIT : -X_AXIS_SHIFT_LIMIT;
        }

        if(absXAxisShiftRadTotal < X_AXIS_FIRST_THRESHOLD) {
            earth.rotateOnWorldAxis(yAxisVector, yAxisShiftRad / 5);
            yAxisShiftRadTotal = 0;
        } else if(absXAxisShiftRadTotal < X_AXIS_SECOND_THRESHOLD && absYAxisShiftRadTotal < Y_AXIS_SHIFT_LIMIT) {
            earth.rotateOnWorldAxis(yAxisVector, yAxisShiftRad / 5);
        }
        else {
            yAxisShiftRadTotal = yAxisShiftRadTotal > 0 ? 1.8 : -1.8;
        }

        previousClientX = event.clientX;
        previousClientY = event.clientY;
    }

    globeElement.addEventListener('mousedown', (event) => {
        isRotating = false;
        previousClientX = event.clientX;
        previousClientY = event.clientY;
        globeElement.addEventListener('mousemove', onMouseMove);
    });

    globeElement.addEventListener('mouseup', () => globeElement.removeEventListener('mousemove', onMouseMove));

    requestAnimationFrame(animate);
}

window.onload = createEarth;