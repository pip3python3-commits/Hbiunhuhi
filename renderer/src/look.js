// Painterly post stack: Kuwahara-style brush filter -> whip blur -> aubergine shadow lift -> vignette -> flash.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const LookShader = {
  uniforms: {
    tDiffuse: { value: null }, res: { value: new THREE.Vector2(720, 1280) },
    whip: { value: 0 }, flash: { value: 0 }, vig: { value: 0.55 }, sat: { value: 1.12 },
    contrast: { value: 1.08 }, paint: { value: 1.0 }, shadowTint: { value: new THREE.Color('#34202B') },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float whip, flash, vig, sat, contrast, paint; uniform vec3 shadowTint;
    varying vec2 vUv;
    float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
    // 4-sector Kuwahara (radius 2): flattens fine texture into soft painted patches, keeps edges crisp
    vec3 kuwahara(vec2 uv){
      vec2 px = 1.0/res;
      vec3 m[4]; float v[4];
      for(int k=0;k<4;k++){ m[k]=vec3(0.); v[k]=0.; }
      for(int k=0;k<4;k++){
        float sx = (k==0||k==3) ? -1. : 1.;
        float sy = (k<2) ? -1. : 1.;
        vec3 s=vec3(0.); float s2=0.;
        for(int j=0;j<3;j++) for(int i=0;i<3;i++){
          vec3 c = texture2D(tDiffuse, uv + vec2(sx*float(i), sy*float(j))*px).rgb;
          s += c; s2 += lum(c)*lum(c);
        }
        s /= 9.; m[k]=s; v[k]=s2/9. - lum(s)*lum(s);
      }
      vec3 best=m[0]; float bv=v[0];
      for(int k=1;k<4;k++) if(v[k]<bv){ bv=v[k]; best=m[k]; }
      return best;
    }
    void main(){
      vec3 base = mix(texture2D(tDiffuse, vUv).rgb, kuwahara(vUv), paint);
      if(whip > 0.002){
        vec3 acc = vec3(0.);
        for(int i=-5;i<=5;i++) acc += texture2D(tDiffuse, vUv + vec2(float(i)/5.*whip*0.09, 0.)).rgb;
        base = mix(base, acc/11., clamp(whip*1.6, 0., 1.));
      }
      float l = lum(base);
      base += shadowTint * (1.0 - smoothstep(0.0, 0.18, l)) * 0.35;           // lift blacks toward aubergine
      base = (base - 0.18) * contrast + 0.18;
      base = mix(vec3(lum(base)), base, sat);
      vec2 q = (vUv - 0.5) * vec2(1.0, 0.82);
      base *= 1.0 - vig * pow(dot(q,q)*2.2, 1.35);
      base = mix(base, vec3(1.0, 0.96, 0.9), flash);
      gl_FragColor = vec4(max(base, vec3(0.)), 1.);
    }`,
};

export function createLook(renderer, scene, camera, w, h, opts = {}) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: opts.msaa ?? 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  const pass = new ShaderPass(LookShader);
  pass.uniforms.res.value.set(w, h);
  pass.uniforms.paint.value = opts.paint ?? 1.0;
  composer.addPass(pass);
  composer.addPass(new OutputPass());
  return { composer, u: pass.uniforms };
}
