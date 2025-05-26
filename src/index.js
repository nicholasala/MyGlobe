import {
    AmbientLight,
    Color,
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
    TEXTURE_ADDRESS
} from './constants';

function createEarth() {
    let isRotating = true;
    
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
    pointLight.position.set(5, 0, 5);
    scene.add(pointLight);

    const render = () => {
        renderer.render(scene, camera);
    }

    const update = () => {
        earth.rotateOnWorldAxis(new Vector3(0, 1, 0), EARTH_ROTATION_ANGLE_RADIANS);
    }

    const animate = () => {
        render();
        if(isRotating) update();
        requestAnimationFrame(animate);
    }

    //Mouse events
    globeElement.addEventListener('mousedown', () => {
        isRotating = false;
    });

    requestAnimationFrame(animate);
}

window.onload = createEarth;