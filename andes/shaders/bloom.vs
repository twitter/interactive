attribute vec3 position;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

void main(void) {
  gl_Position = projectionMatrix * worldMatrix * vec4(position, 1.0);
}



