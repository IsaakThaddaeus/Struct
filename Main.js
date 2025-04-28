import { XPBD } from './XPBD.js';
import { Config } from './Config.js';
import { Editor } from './Editor.js';
import { SceneBuilder } from './SceneBuilder.js';
import { Renderer } from './Renderer.js';

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

//const config = SceneBuilder.buildDefaultScene(canvas);
const config = SceneBuilder.buildEmptyScene(canvas);
const xpbd = new XPBD(config);
const editor = new Editor(config);
const renderer = new Renderer(config);

let lastTime = performance.now();

function update() {
  const now = performance.now();
  const delta = now - lastTime;      
  lastTime = now;
  const fps = 1000 / delta;   

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  xpbd.update();
  renderer.render(ctx);

  ctx.fillStyle = 'black';
  ctx.font = '16px Arial';
  ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 20);
  
  requestAnimationFrame(update);
}
update();
 
