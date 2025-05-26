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
    //Scene
    const scene = new Scene();
    const renderer = new WebGLRenderer({ canvas: document.getElementById(GLOBE_ELEMENT_ID) });
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
    addAmbientLight(scene, LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY);
    addPointLight(scene, LIGHT_COLOR, POINT_LIGHT_INTENSITY, 5, 0, 5);

    const render = () => {
        renderer.render(scene, camera);
    }

    const update = () => {
        earth.rotateOnWorldAxis(new Vector3(0, 1, 0), EARTH_ROTATION_ANGLE_RADIANS);
    }

    const animate = () => {
        render();
        update();
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function addAmbientLight(scene, color, intensity) {
    scene.add(new AmbientLight(color, intensity));
}

function addPointLight(scene, color, intensity, x, y, z) {
    const pointLight = new PointLight(color, intensity);
    pointLight.position.set(x, y, z);
    scene.add(pointLight);
}

window.onload = createEarth;