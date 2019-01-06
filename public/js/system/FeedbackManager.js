import * as THREE from "three";
import StandardManager from "./StandardManager";
import { Earcut } from '../../../node_modules/three/examples/js/postprocessing/EffectComposer.js';
import * as feedback from '../shaders/feedback';

export default class PostManager extends StandardManager{
  constructor(options){
    super(options);

    // override background and set renderer clear color for feedback
    this.scene.background = null;
    this.renderer.setClearColor(0x000000, 0);

    /*
      Setup an orthographic camera for rendering-to-texture
    */
    const setupCamera = () => {
      this.orthoCamera = new THREE.OrthographicCamera(
          this.width / - 2,
          this.width / 2,
          this.height / 2,
          this.height / -2,
          1,
          1000
      );

      this.orthoCamera.position.z = 1;
    }

    /*
      Setup all appropriate targets for each stage
    */
    const setupTargets = () => {
      this.mainTarget   = new THREE.WebGLRenderTarget( this.width, this.height, {
        format: THREE.RGBAFormat
      });
      this.interTarget  = new THREE.WebGLRenderTarget( this.width, this.height, {
        format: THREE.RGBAFormat
      });
      this.outputTarget = new THREE.WebGLRenderTarget( this.width, this.height, {
        format: THREE.RGBAFormat
      });

      setupFeedbackScene();
      setupOutputScene();
    }

    /*
      The feedback scene is to allow us to render-to-texture.
    */
    const setupFeedbackScene = () => {
      this.feedbackScene = new THREE.Scene();

      this.feedbackUniforms = {
          tex0: { value: this.interTarget.texture },
          tex1: { value: this.mainTarget.texture },
          feedback: { value: 0.98 },
          scale: { value: 0.98 },
          vPoint: { value: [0.5,0.5] }
      };

      this.gui.feedback = this.gui.addFolder('Feedback Shader');

      this.gui.feedback.add(this.feedbackUniforms.feedback,'value',0,1).name('Amount');
      this.gui.feedback.add(this.feedbackUniforms.scale,'value',0,2).name('Scale');
      this.gui.feedback.open();

      const geometry = new THREE.PlaneBufferGeometry( 2., 2.);
      const material = new THREE.ShaderMaterial({
        uniforms: this.feedbackUniforms,
        vertexShader: feedback.vert,
        fragmentShader: feedback.frag,
        transparent: true
      });

      const quad = new THREE.Mesh( geometry, material );
      this.feedbackScene.add( quad );
    }

    // ============================================================================
    const sharpen = () => {
      sharpenScene = new THREE.Scene();

      sharpenUniforms = {
        tex0: { value: textureB.texture },
        width: { value: 0.008 }
      }

      sharpenShaderMaterial = new THREE.ShaderMaterial( {
        uniforms: sharpenUniforms,
        vertexShader: sharpenShader.vert,
        fragmentShader: sharpenShader.frag
      } );

      var plane2 = new THREE.PlaneBufferGeometry( 2., 2.);
      var sharpenObject = new THREE.Mesh( plane2, sharpenShaderMaterial );
      sharpenScene.add(sharpenObject);
    }

    // ============================================================================
    const barrelBlurChroma = () => {
      barrelScene = new THREE.Scene();

      barrelUniforms = {
        tex0: { value: textureC.texture },
        barrelPower: { value: 0.4 },
        zoom: { value: 1.0 }
      }

      barrelShaderMaterial = new THREE.ShaderMaterial( {
        uniforms: barrelUniforms,
        vertexShader: barrelBlurShader.vert,
        fragmentShader: barrelBlurShader.frag
      } );

      var plane3 = new THREE.PlaneBufferGeometry( 2., 2.);
      var barrelObject = new THREE.Mesh( plane3, barrelShaderMaterial );
      barrelScene.add(barrelObject);
    }

    /*
      The output scene is the final view, upon which we render all
      prior output upon a simple plane buffer object.
    */
    const setupOutputScene = () => {
      this.outputScene = new THREE.Scene();
      this.outputScene.background = new THREE.Color( 0x000000 );

      const geometry = new THREE.PlaneBufferGeometry( this.width, this.height );
      const material = new THREE.MeshBasicMaterial({
        map: this.outputTarget.texture,
        transparent: true
      });

      this.outputQuad = new THREE.Mesh( geometry, material );
      this.outputScene.add( this.outputQuad );
    }

    setupCamera();
    setupTargets();
  }

  update(){
    this.updateEntities();

    this.camera.update();

    //render the main scene to the main target
    this.renderer.render(this.scene, this.camera.getCamera(), this.mainTarget);
    //render the feedback to the output target
    this.renderer.render(this.feedbackScene, this.orthoCamera, this.outputTarget);

    //target pingpong
    let tempTarget = this.interTarget;
    this.interTarget = this.outputTarget;
    this.outputTarget = tempTarget;

    this.feedbackUniforms.tex0.value = this.interTarget.texture;
    this.outputQuad.material.map = this.outputTarget.texture;

    this.renderer.render(this.outputScene, this.orthoCamera);
  }
}
