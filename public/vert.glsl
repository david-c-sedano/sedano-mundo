varying vec3 vNormal;
varying vec3 vLightDir;

void main() {
    vNormal = normalize(normalMatrix * normal)
    vLightDir = normalize(vec3(5.0, 5.0, 5.0));
    vec3 newPos = position + normal * 0.02;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
