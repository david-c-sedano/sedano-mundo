let DEBUG = true; // set to false for production

import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

let play = true
document.getElementById("stop-anim").addEventListener("click", function() {
    play = !play;
})

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xb5e1f2);
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.debug.checkShaderErrors = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(5, 5, 5);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

let island = new THREE.Group();
let modelLoader = new GLTFLoader();
modelLoader.load("/volcano-low-poly.glb", function(gltf) {
    island = gltf.scene;
    island.scale.set(0.001, 0.001, 0.001);
    island.position.set(0, 0, 0);
    
    scene.add(island);
});

// Create a parent cube (invisible, just for grouping)
let cubeParent = new THREE.Object3D();
cubeParent.position.set(0, 5, 0);
scene.add(cubeParent);
let cubeSize = 30;

modelLoader.load("/cherry-blossom-petal.glb", function(gltf) {
    let particle = gltf.scene;
    let geometry;
    let material;
    particle.traverse((child) => {
        if (child.isMesh) {
            geometry = child.geometry;
            material = child.material;
        }
    })

    let count = 200;
    let dummy = new THREE.Object3D();
    let minDist = 13;
    // NOTE: Im gonna have to contribute a particle system to three.js at some point
    // because this is disgraceful, InstancedMesh being the only way supported to do particles
    let instancedMesh = new THREE.InstancedMesh(geometry, material, count);

    for (let i = 0; i < count; i++) {
        // generate a random direction in 3d space
        let dir = new THREE.Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize();

        // calculate a random distance within a certain range
        let dist = minDist + Math.random() * (cubeSize - minDist);
        // the position can be expressed via direction + length from the origin
        // this scalar multipliation with the direction vector will give us the position
        let pos = dir.multiplyScalar(dist);

        // clone and position the particle
        dummy.position.copy(pos);

        // set the rotation of the particles randomly for effect (theyre not updated in the main event loop)
        let rot_x = Math.random() * Math.PI * 2;
        let rot_y = Math.random() * Math.PI * 2;
        let rot_z = Math.random() * Math.PI * 2;
        dummy.rotation.set(rot_x, rot_y, rot_z);
        // add the particle to the parent cube, so when the cube rotates, the particles move around
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    cubeParent.add(instancedMesh);
})

// set up path for the camera to follow like a drone
const pathPoints = [
    new THREE.Vector3(10, 10, 10),
    new THREE.Vector3(5, 5, 5),
    new THREE.Vector3(-1, 2.5, 4),
    new THREE.Vector3(-7, 2, -1.5),
    new THREE.Vector3(-1.5, 4, -5),
    new THREE.Vector3(3.5, 3, -2.5),
    new THREE.Vector3(4.5, 3, -1.5),
    new THREE.Vector3(5, 5, 5),
    new THREE.Vector3(10, 10, 10),
];
const curve = new THREE.CatmullRomCurve3(pathPoints);
curve.closed = false;

// set up raycasting so we can actually create paths
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
if (DEBUG) {
    window.addEventListener("click", logPoint, false);
}
// yes this was literally how I set up the path for the camera to follow
function logPoint(event) {
    // normalize mouse coordinates (-1 to 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersection = raycaster.intersectObject(island, true);
    if (intersection.length > 0) {
        console.log(intersection[0].point);
    }
}

let t = 0; // a value from 0 to 1, like the progress from starting to finishing the path
let speed = 0.001;
let target = new THREE.Vector3();

function cameraMove() {
    t += speed;
    if (t > 1) t = 0; // reset the path

    let pos = curve.getPointAt(t);
    camera.position.copy(pos);

    let lookAtPoint;
    let lerpSpeed;
    if (t < 0.8) {
        lerpSpeed = 0.5;
        lookAtPoint = curve.getPointAt((t + 0.01) % 1);
    }
    else {
        lerpSpeed = 0.005;
        lookAtPoint = new THREE.Vector3(0, 0, 0);
    }
    // interpolate the camera angle so it's always *smooth*
    target = target.lerp(lookAtPoint, lerpSpeed);
    camera.lookAt(target);
}

function animate() {
    // do this to set the frame rate
    // probably the laziest way of doing so, but I don't know of a better way
    // gonna have to use delta time or smthn if i get complaints
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 1000/60);

    if (play) {
        cameraMove();
    } else {
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);
    }

    cubeParent.rotation.y += 0.008;
    cubeParent.rotation.z -= 0.008;

    renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
    resizeTimeout = setTimeout(() => {
        let width = this.window.innerWidth;
        let height = this.window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        prevWidth = width;
        prevHeight = height;
    }, 500);
});

animate();
