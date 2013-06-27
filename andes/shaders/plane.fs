#ifdef GL_ES
precision highp float;
#endif

#define LIGHT_MAX 4

#define FILL 0.
#define GRID 1.
#define CONTOUR 2.
#define HEAT 3.
#define HYBRID_1 4.
#define HYBRID_2 5.
#define HYBRID_3 6.
#define HYBRID_4 7.

varying vec4 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vLightPosition;
varying vec2 vTexCoord1;
varying float zpos;

uniform bool enableLights;
uniform float shininess;
uniform vec3 ambientColor;
uniform vec3 pointLocation[LIGHT_MAX];
uniform vec3 pointColor[LIGHT_MAX];
uniform vec3 pointSpecularColor[LIGHT_MAX];

uniform sampler2D sampler2; //depth map
uniform sampler2D sampler3; //sat map
uniform sampler2D sampler4; //sat map
uniform sampler2D sampler5; //sat map
uniform sampler2D sampler6; //sat map

uniform mat4 viewMatrix;
uniform float elevation;
uniform vec3 background;
uniform vec3 foreground;
uniform vec3 texture;
uniform float enableShadow;

uniform float near;
uniform float far;

float unpack (vec4 colour) {
	const vec4 bitShifts = vec4(1.0,
					1.0 / 255.0,
					1.0 / (255.0 * 255.0),
					1.0 / (255.0 * 255.0 * 255.0));
	return dot(colour, bitShifts);
}

void main(void) {
  float LinearDepthConstant = 1.0 / (far - near);

  vec3 lightWeighting;
  vec3 lightDirection;
  float specularLightWeighting = 0.0;
  float diffuseLightWeighting = 0.0;
  vec3  specularLight = vec3(0.0, 0.0, 0.0);
  vec3  diffuseLight = vec3(0.0, 0.0, 0.0);

  vec3 transformedPointLocation;
  vec3 normal = normalize(vTransformedNormal.xyz);

  vec3 eyeDirection = normalize(-vPosition.xyz);
  vec3 reflectionDirection;

  vec3 pointWeight = vec3(0.0, 0.0, 0.0);

  transformedPointLocation = (viewMatrix * vec4(pointLocation[0], 1)).xyz;
  lightDirection = normalize(transformedPointLocation - vPosition.xyz);

  reflectionDirection = reflect(-lightDirection, normal);
  specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess);
  specularLight += specularLightWeighting * pointSpecularColor[0];

  diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
  diffuseLight += diffuseLightWeighting * pointColor[0];
  lightWeighting = ambientColor + diffuseLight + specularLight;

  //shadow factor
  vec3 depth = vLightPosition.xyz / vLightPosition.w;
  depth.z = length(vPosition.xyz - pointLocation[0]) * LinearDepthConstant;
  float shadow = 1.0;
  depth.z *= 1.0;
  float shadowDepth = unpack(texture2D(sampler2, depth.xy));
  if (depth.z > shadowDepth) {
    shadow = (1. - enableShadow) * 0.5 + 0.5;
  }

  vec4 colorFrom;
  vec4 colorTo;
  vec4 fragmentColor;

  if (texture.x == FILL) {
    colorFrom = vec4(background, 1);
  }
  if (texture.y == FILL) {
    colorTo = vec4(background, 1);
  }
  if (texture.x == GRID) {
    colorFrom = vec4(background, 1);
    vec2 dots = vTexCoord1 * 600.;
    if (abs(mod(dots.x, 10.)) <= 2. || abs(mod(dots.y, 10.)) <= 2.) {
      colorFrom = vec4(foreground, 1);
    }
  }
  if (texture.y == GRID) {
    colorTo = vec4(background, 1);
    vec2 dots = vTexCoord1 * 600.;
    if (abs(mod(dots.x, 10.)) <= 2. || abs(mod(dots.y, 10.)) <= 2.) {
      colorTo = vec4(foreground, 1);
    }
  }
  if (texture.x == HYBRID_1) {
    colorFrom = texture2D(sampler3, vTexCoord1);
  }
  if (texture.y == HYBRID_1) {
    colorTo = texture2D(sampler3, vTexCoord1);
  }
  if (texture.x == HYBRID_2) {
    colorFrom = texture2D(sampler4, vTexCoord1);
  }
  if (texture.y == HYBRID_2) {
    colorTo = texture2D(sampler4, vTexCoord1);
  }
  if (texture.x == HYBRID_3) {
    colorFrom = texture2D(sampler5, vTexCoord1);
  }
  if (texture.y == HYBRID_3) {
    colorTo = texture2D(sampler5, vTexCoord1);
  }
  if (texture.x == HYBRID_4) {
    colorFrom = texture2D(sampler6, vTexCoord1);
  }
  if (texture.y == HYBRID_4) {
    colorTo = texture2D(sampler6, vTexCoord1);
  }
  if (texture.x == CONTOUR) {
    colorFrom = vec4(background, 1);
    float dots = zpos * 600.;
    if (abs(mod(dots, 50. * elevation)) <= 50. * elevation * 0.15) {
      colorFrom = vec4(foreground, 1);
    }
  }
  if (texture.y == CONTOUR) {
    colorTo = vec4(background, 1);
    float dots = zpos * 600.;
    if (abs(mod(dots, 50. * elevation)) <= 50. * elevation * 0.15) {
      colorTo = vec4(foreground, 1);
    }
  }
  if (texture.x == HEAT) {
    vec4 from = vec4(background, 1);
    vec4 to = vec4(foreground, 1);
    colorFrom = from + (to - from) * zpos / elevation;
  }
  if (texture.y == HEAT) {
    vec4 from = vec4(background, 1);
    vec4 to = vec4(foreground, 1);
    colorTo = from + (to - from) * zpos / elevation;
  }

  fragmentColor = colorFrom + (colorTo - colorFrom) * texture.z;

  fragmentColor = vec4(fragmentColor.rgb * shadow, fragmentColor.a);
  if (enableLights) {
    gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
  } else {
    gl_FragColor = fragmentColor;
  }
}

