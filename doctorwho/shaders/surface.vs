attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord1;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldInverseTransposeMatrix;

varying vec2 vTexCoord1;
varying vec4 vTransformedNormal;
varying vec4 vPosition;
varying float normal_index;


void main(void) {
  vPosition = worldMatrix * vec4(position, 1.0);
  vTransformedNormal = worldInverseTransposeMatrix * vec4(normal, 1.0);
  normal_index = 1.;
  if (normal.y == 1. || normal.y == -1.) {
    normal_index = 3.;
  }
  vTexCoord1 = texCoord1;
  gl_Position = projectionMatrix * vPosition;
}
