const vert = `
varying vec2 texcoord;

varying vec2 texcoord11;
varying vec2 texcoord00;
varying vec2 texcoord02;
varying vec2 texcoord20;
varying vec2 texcoord22;

uniform float width;

void main()
{
  gl_Position = vec4( position, 1.0 );

  texcoord = uv;

  texcoord11 = texcoord;
  texcoord00 = texcoord + vec2(-width, -width);
  texcoord02 = texcoord + vec2( width, -width);
  texcoord20 = texcoord + vec2( width,  width);
  texcoord22 = texcoord + vec2(-width,  width);
}
`;

const frag = `
uniform sampler2D tex0;

varying vec2 texcoord;

varying vec2 texcoord11;
varying vec2 texcoord00;
varying vec2 texcoord02;
varying vec2 texcoord20;
varying vec2 texcoord22;

void main()
{
  vec4 s11 = texture2D(tex0, texcoord11);
  vec4 s00 = texture2D(tex0, texcoord00);
  vec4 s02 = texture2D(tex0, texcoord02);
  vec4 s20 = texture2D(tex0, texcoord20);
  vec4 s22 = texture2D(tex0, texcoord22);

  vec4 sharp = 5.0 * s11 - (s00 + s02 + s20 + s22);
    vec4 color = texture2D(tex0, texcoord);

  gl_FragColor = sharp;
}
`;

export { vert, frag }
