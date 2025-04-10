import { XPBDScene } from './XPBDScene.js';
import { createSceneConfig } from './sceneConfig.js';

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const config = createSceneConfig();
config.canvas = canvas; // wichtig für BoundaryCollision


const scene = new XPBDScene(config);

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  scene.update();
  scene.render(ctx);
  requestAnimationFrame(loop);
}
loop();
