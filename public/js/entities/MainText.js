import * as THREE from "three";
import StandardEntity from "./StandardEntity";

export default class MainText extends StandardEntity{

  setup(){
    this.textCanvas = document.createElement('canvas');
    this.textCanvas.id = 'textCanvas';

    this.textCanvas.width  = 1024;
    this.textCanvas.height = 1024;

    this.textCtx = this.textCanvas.getContext("2d");
    this.textCtx.textAlign = 'center';

    if(this.manager.width < 500){
      this.textCtx.font = "100px Helvetica";
    }else{
      this.textCtx.font = "120px Helvetica";
    }

    this.textCtx.beginPath();
    this.textCtx.rect(0, 0, this.textCanvas.width,this.textCanvas.width);
    // textCtx.fillStyle = "orange";
    this.textCtx.fill();

    this.textCtx.lineWidth = 1;
    this.textCtx.fillStyle = 'white';
    this.textCtx.fillText("aceslowman", this.textCanvas.width/2,this.textCanvas.width/2);

    this.textTexture = new THREE.Texture(this.textCanvas);
    this.textTexture.needsUpdate = true;

    this.geometry = new THREE.PlaneBufferGeometry(this.manager.width, this.manager.width);
    this.material = new THREE.MeshBasicMaterial({map: this.textTexture});

    this.mesh = new THREE.Mesh(this.geometry,this.material);

    this.manager.scene.add(this.mesh);
  }

  update(){

  }

  onWindowResize(){
    console.log('hit');
  }
}
