attribute vec3 position;

uniform mat4 objectMatrix;
uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldInverseTransposeMatrix;

uniform mat4 depthView;
uniform mat4 depthProjection;

varying vec4 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vLightPosition;
varying vec2 vTexCoord1;
varying float zpos;

uniform sampler2D sampler1;
uniform vec2 size;
uniform float elevation;

const mat4 scaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

vec3 avg_sample(vec2 coord) {
  vec3 ans = vec3(0);
  ans += texture2D(sampler1, coord + vec2(0, 0)).rgb;
  return ans;
}

void main(void) {
  vec3 pos = position;
  vec2 coord1 = vec2(-position.x, position.z) + 0.5;
  vec2 coord2 = vec2(-position.x - 1. / size.x, position.z) + 0.5;
  vec2 coord3 = vec2(-position.x, position.z + 1. / size.y) + 0.5;

  float z1 = length(avg_sample(coord1)) * elevation;
  float z2 = length(avg_sample(coord2)) * elevation;
  float z3 = length(avg_sample(coord3)) * elevation;

  vec3 v1 = vec3(position.x, z1, position.z);
  vec3 v2 = vec3(position.x, z2, position.z + 1. / size.y);
  vec3 v3 = vec3(position.x + 1. / size.x, z3, position.z);

  vec3 diff1 = v2 - v1;
  vec3 diff2 = v3 - v1;
  vec3 normal = cross(diff2, diff1);

  pos.y = z1;
  zpos  = z1;
  vTexCoord1 = coord1;
  vPosition = objectMatrix * vec4(pos, 1);
  vLightPosition = scaleMatrix * depthProjection * depthView * objectMatrix * vec4(pos, 1);
  vTransformedNormal = worldInverseTransposeMatrix * vec4(normal, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vPosition;
}
