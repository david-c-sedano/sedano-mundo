varying vec3 vNormal;
varying vec3 vLightDir;

void main() {
     float intensity = dot(vNormal, vLightDir);

     if (intensity > 0.5) {
     	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
     }
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
     }
}