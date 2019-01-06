import * as THREE from "three";
import { EffectComposer } from '../utilities/EffectComposer/EffectComposer.js';
import { RenderPass } from '../utilities/EffectComposer/RenderPass.js';
import { TexturePass } from '../utilities/EffectComposer/TexturePass.js';
import * as feedback from '../shaders/feedback';
import * as barrelBlurChroma from '../shaders/barrelBlurChroma';
import * as sharpen from '../shaders/sharpen';

export default class PostStack {
  constructor(manager, options){
    this.manager = manager;

    this.setupInputComposer();
    this.setupIntermediateComposer();
    this.setupFinalComposer();
  }

setupInputComposer(){
  this.inputTarget = new THREE.WebGLRenderTarget( this.manager.width, this.manager.height );

  this.inputComposer = new THREE.EffectComposer(this.manager.renderer, this.inputTarget);
  this.inputComposer.setSize(this.manager.width, this.manager.height);

  let mat_feedback = new THREE.ShaderMaterial({
    uniforms: {
      tex1: { value: this.inputTarget.texture },
      feedback: { value: 0.9 },
      scale: { value: 0.992 },
      vPoint: { value: [0.5,0.5] }
    },
    vertexShader: feedback.vert,
    fragmentShader: feedback.frag
  });

  const inputPass = new THREE.RenderPass(this.manager.scene, this.manager.camera.getCamera());
  const feedbackPass = new THREE.ShaderPass(mat_feedback, "feedback");

  this.inputComposer.addPass(inputPass);
  this.inputComposer.addPass(feedbackPass);
}

  setupIntermediateComposer(){
    this.intermediateTarget = new THREE.WebGLRenderTarget( this.manager.width, this.manager.height );

    this.intermediateComposer = new THREE.EffectComposer(this.manager.renderer, this.intermediateTarget);
    this.intermediateComposer.setSize(this.manager.width, this.manager.height);

    let mat_sharpen = new THREE.ShaderMaterial({
      uniforms: {
        width: { value: 0.8 }
      },
      vertexShader: sharpen.vert,
      fragmentShader: sharpen.frag
    })

    const inputPass  = new THREE.TexturePass(this.inputTarget.texture, 1.0);
    const sharpenPass  = new THREE.ShaderPass(mat_sharpen, "sharpen");

    this.intermediateComposer.addPass(inputPass);
    this.intermediateComposer.addPass(sharpenPass);
  }

  setupFinalComposer(){ // WORKING
    this.finalComposer = new THREE.EffectComposer(this.manager.renderer);
    this.finalComposer.setSize(this.manager.width, this.manager.height);

    let mat_chroma = new THREE.ShaderMaterial({
      uniforms: {
        barrelPower: { value: 0.4 },
        zoom: { value: 1.0 }
      },
      vertexShader: barrelBlurChroma.vert,
      fragmentShader: barrelBlurChroma.frag
    })

    const inputPass  = new THREE.TexturePass(this.inputTarget.texture, 1.0);
    const chromaPass = new THREE.ShaderPass(mat_chroma, "chroma");

    chromaPass.renderToScreen = true;

    this.finalComposer.addPass(inputPass);
    this.finalComposer.addPass(chromaPass);
  }

  render(delta){
    this.inputComposer.render( delta ); // render to inputTarget
    this.intermediateComposer.render( delta ); // render to intermediateTarget
    this.inputComposer.swapBuffers();

    this.finalComposer.render( delta );
  }

  update(){

  }
}
