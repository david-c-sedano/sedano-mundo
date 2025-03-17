import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";

// set up outline shader, super simple, just colors an entire model black
// I don't think it's worth to keep in in separate files
let blackMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        void main() {
            vec3 newPos = position + normal * 0.02;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
    `,
    fragmentShader: `
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }    
    `,
    side: THREE.BackSide,
});

// set up MY toon shader
let toonVertexShader = await fetch("/vert.glsl").then(response => response.text())
let toonFragmentShader = await fetch("/frag.glsl").then(response => response.text())
let toonMaterial = new THREE.ShaderMaterial({
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    vertexColors: true,
})

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xb5e1f2)
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement);

let light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(10, 10, 0);
scene.add(light);

let island
let outline
let modelLoader = new GLTFLoader();
modelLoader.load("/volcano-low-poly.glb", function(gltf) {
    island = gltf.scene;
    island.scale.set(0.001, 0.001, 0.001);
    island.position.set(0, 0, 0);
    // handle rendering of outline
    outline = island.clone()

    // apply shaders
    island.traverse((child) => {
	if (child.isMesh && child.geometry.hasAttribute("color")) {
	    child.material = toonMaterial;
	}
    });
    
    outline.traverse((child) => {
	if (child.isMesh) {
	    child.material = blackMaterial;
	}
    });
    
    outline.scale.setScalar(0.001005);
    scene.add(outline);
    scene.add(island);
    
    let bbox = new THREE.Box3().setFromObject(island);
    let center = bbox.getCenter(new THREE.Vector3());
    let size = bbox.getSize(new THREE.Vector3());

    let maxDim = Math.max(size.x, size.y, size.x);
    let fov = camera.fov * (Math.PI / 180);
    let distance = Math.abs(maxDim / Math.sin(fov / 2));

    camera.position.set(center.x, center.y, distance * 0.2);
    
    console.log("Model Size:", bbox.getSize(new THREE.Vector3()));
    console.log("Model Position:", island.position);
});


let angle = 0;
function animate() {
    requestAnimationFrame(animate);

    island.rotation.y += 0.0025
    outline.rotation.y += 0.0025
    
    renderer.render(scene, camera);
}
animate();
