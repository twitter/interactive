attribute vec3 position;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldInverseTransposeMatrix;

uniform sampler2D sampler1;
uniform float elevation;

varying vec4 vPosition;

vec3 avg_sample(vec2 coord) {
  vec3 ans = vec3(0);
  ans += texture2D(sampler1, coord + vec2(0, 0)).rgb;
  return ans;
}

void main(void) {
  vec3 pos = position;
  vec2 coord1 = vec2(-position.x, position.z) + 0.5;
  float z1 = length(avg_sample(coord1)) * elevation;
  pos.y = z1;
  vPosition = worldMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * vPosition;
}

