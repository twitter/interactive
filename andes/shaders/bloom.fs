#ifdef GL_ES
	precision highp float;
#endif

uniform sampler2D sampler1;
uniform float width;
uniform float height;

uniform float blurX;
uniform float blurY;
uniform int radius;


float gaussian (float x, float deviation) {
	return (1.0 / sqrt(2.0 * 3.141592 * deviation)) * exp(-((x * x) / (2.0 * deviation)));
}

void main() {
  vec2 pixel = 1. / vec2(width, height);
  vec2 texCoord1 = gl_FragCoord.xy * pixel;

	float halfBlur = float(radius) * 0.5;
	//float deviation = halfBlur * 0.5;
	vec4 colour;

	if (blurX > 0.) {
		for (int i = 0; i < 10; ++i) {
			if ( i >= radius )
				break;

			float offset = float(i) - halfBlur;
			colour += texture2D(sampler1, texCoord1 + vec2(offset * pixel.x, 0.0)) /* gaussian(offset, deviation)*/;
		}
	}
	else if (blurY > 0.) {
		for (int i = 0; i < 10; ++i) {
			if ( i >= radius )
				break;

			float offset = float(i) - halfBlur;
			colour += texture2D(sampler1, texCoord1 + vec2(0.0, offset * pixel.y)) /* gaussian(offset, deviation)*/;
		}
	}

	colour = colour / float(radius);
	gl_FragColor = colour;
}
