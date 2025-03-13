varying vec3 vNormal;
varying vec3 vLightDir;

void main() {
    vNormal = normalize(normalMatrix * normal)
    vLightDir = normalize(vec3(5.0, 5.0, 5.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
