import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xb5e1f2)
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

let ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

let island
let loader = new GLTFLoader();
loader.load("/volcano-low-poly.glb", function(gltf) {
    island = gltf.scene;
    island.scale.set(0.001, 0.001, 0.001);
    island.position.set(0, 0, 0);

    scene.add(island);
    
    let bbox = new THREE.Box3().setFromObject(island);
    let center = bbox.getCenter(new THREE.Vector3());
    let size = bbox.getSize(new THREE.Vector3());

    let maxDim = Math.max(size.x, size.y, size.x);
    let fov = camera.fov * (Math.PI / 180);
    let distance = Math.abs(maxDim / Math.sin(fov / 2));

    camera.position.set(center.x, center.y, distance * 0.2);
    camera.lookAt(center);
    
    console.log("Model Size:", bbox.getSize(new THREE.Vector3()));
    console.log("Model Position:", island.position);

    gltf.scene.traverse((child) => {
	if (child.isMesh) {
	    console.log(child.name, child.material);
	}
    });
});

function animate() {
    requestAnimationFrame(animate);
    if (island) {
	island.rotation.y -= 0.005;
    }

    renderer.render(scene, camera);
}
animate();
