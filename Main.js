import { XPBD } from './XPBD.js';
import { Config } from './Config.js';
import { Editor } from './Editor.js';
import { SceneBuilder } from './SceneBuilder.js';
import { Renderer } from './Renderer.js';

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();



const config = SceneBuilder.buildDefaultScene(canvas);
const xpbd = new XPBD(config);
const editor = new Editor(config, canvas);
const renderer = new Renderer(config);

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  xpbd.update();
  renderer.render(ctx);
  
  requestAnimationFrame(update);
}
update();
