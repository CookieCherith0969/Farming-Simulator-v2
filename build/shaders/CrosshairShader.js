/**
 * Full-screen textured quad shader
 */

const CrosshairShader = {

	name: 'CrosshairShader',

	uniforms: {

		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
		'size': {value: 10},
		'width': {value: 512},
		'height': {value: 512}
	},

	vertexShader: /* glsl */`
		
		varying vec2 vUv;
		varying vec4 clipPos;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			clipPos = gl_Position;
		}`,

	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;
		uniform float size;

		uniform float width;
		uniform float height;

		varying vec2 vUv;
		varying vec4 clipPos;

		void main() {
			vec2 screenPos;
			screenPos.x = (clipPos.x+1.0)/2.0*width;
			screenPos.y = (clipPos.y+1.0)/2.0*height;
			vec2 center;
			center.x = width/2.0;
			center.y = height/2.0;
			if(screenPos.x > center.x-size/2.0 && screenPos.x < center.x+size/2.0 && screenPos.y > center.y-size/2.0 && screenPos.y < center.y+size/2.0){
				gl_FragColor = vec4(1.0,1.0,1.0,1.0);
			}
			else{
				vec4 texel = texture2D( tDiffuse, vUv );
				gl_FragColor = opacity * texel;
			}


		}`

};

export { CrosshairShader };
