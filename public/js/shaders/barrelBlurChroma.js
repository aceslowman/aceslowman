const vert = `
varying vec2 vUv;

void main()	{
    vUv = uv;
    gl_Position = vec4( position, 1.0 );
}
`;

const frag = `
// adapted from
// https://github.com/SableRaf/Filters4Processing/blob/master/sketches/BarrelBlurChroma/data/barrelBlurChroma.glsl

uniform sampler2D tex0;
varying vec2 texcoord0;
varying vec2 texdim0;
varying vec2 vUv;

uniform float barrelPower;
uniform float zoom;

const int num_iter = 12;
const float reci_num_iter_f = 1.0 / float(num_iter);

vec2 barrelDistortion(vec2 coord, float amt) {
    vec2 cc = coord - 0.5;
    float dist = dot(cc, cc);
    return coord + cc * dist * amt;
}

float sat( float t ){
    return clamp( t, 0.0, 1.0 );
}

float linterp( float t ) {
    return sat( 1.0 - abs( 2.0*t - 1.0 ) );
}

float remap( float t, float a, float b ) {
    return sat( (t - a) / (b - a) );
}

vec3 spectrum_offset( float t ) {
    vec3 ret;
    float lo = step(t,0.5);
    float hi = 1.0-lo;
    float w = linterp( remap( t, 1.0/6.0, 5.0/6.0 ) );
    ret = vec3(lo,1.0,hi) * vec3(1.0-w, w, 1.0-w);

    return pow( ret, vec3(1.0/2.2) );
}

void main()
{
    vec2 uv = vUv;

    uv -= 0.5;
    uv += 0.5/zoom;
    uv *= zoom;

    vec3 sumcol = vec3(0.0);
    vec3 sumw = vec3(0.0);
    for ( int i=0; i<num_iter;++i )
    {
        float t = float(i) * reci_num_iter_f;
        vec3 w = spectrum_offset( t );
        sumw += w;
        sumcol += w * texture2D( tex0, barrelDistortion(uv, barrelPower*t)).rgb;
    }

    gl_FragColor = vec4(sumcol.rgb / sumw, 1.0);
}
`;

export { vert, frag }
