import * as THREE from 'three';
import {EffectComposer} from './build/postprocessing/EffectComposer.js';
import {RenderPass} from './build/postprocessing/RenderPass.js';
import {SSAOPass} from './build/postprocessing/SSAOPass.js';
import {OutputPass} from './build/postprocessing/OutputPass.js';
import { CrosshairShader } from './build/shaders/CrosshairShader.js';
import { ShaderPass } from './build/postprocessing/ShaderPass.js';
import * as ENVIRONMENT from './build/environment.js';
import * as INVENTORY from './build/inventory.js';
import * as INTERACTION from './build/interaction.js';
import * as PLAYER from './build/player.js';
import * as VILLAGER from './build/villager.js';
import * as FARMING from './build/farming.js';
import * as COOKING from './build/cooking.js';

var scene = new THREE.Scene();
var colliders = new THREE.Group();
scene.add(colliders);

var gameOver = false;
var gameOverText = getDoc().getElementById("gameOverText");

gameOverText.textContent = "Game Over, Survived n days, reload to play again"
gameOverText.style.opacity = 0;

var daysSurvived = 0;


var prevTime = performance.now();

function getScene(){
    return scene;
}

function getDoc(){
    return document;
}
function getWindow(){
    return window;
}
function getCamera(){
    return PLAYER.getCamera();
}
function getColliders(){
    return colliders.children;
}
function addCollider(object){
    colliders.add(object);
}
function removeCollider(object){
    colliders.remove(object);
}

//var ratio = window.innerWidth/window.innerHeight;
//var camera = new THREE.PerspectiveCamera(45, ratio, 0.1, 1000);
//camera.position.set(0,5,15);
//camera.lookAt(0,0,0);
//scene.add(camera);

var renderer = new THREE.WebGLRenderer();

//colouring the skies
renderer.setClearColor(new THREE.Color(0.5,0.95,1))

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//var controls = new OrbitControls(camera, renderer.domElement);

ENVIRONMENT.setup(scene);
INVENTORY.setup(scene);
PLAYER.setup();
VILLAGER.setup();
COOKING.setup();
FARMING.setup();
//adding lights
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//scene.add(ambientLight);

var effectComposer = new EffectComposer(renderer);
effectComposer.setSize(window.innerWidth, window.innerHeight);
const renderPass = new RenderPass(scene, getCamera());
effectComposer.addPass(renderPass);
/*const ssaoPass = new SSAOPass(scene,getCamera(),window.innerWidth,window.innerHeight,64);
effectComposer.addPass(ssaoPass);*/
const outputPass = new OutputPass(scene,getCamera());
effectComposer.addPass(outputPass);
const crosshair = new ShaderPass(CrosshairShader);
effectComposer.addPass(crosshair);
crosshair.uniforms.width.value = window.innerWidth;
crosshair.uniforms.height.value = window.innerHeight;

var OnResize = function(){
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize(width,height);
    effectComposer.setSize(width,height);
    crosshair.uniforms.width.value = width;
    crosshair.uniforms.height.value = height;
    getCamera().aspect = width/height;
    getCamera().updateProjectionMatrix();
    //renderer.render(scene,getCamera());
    effectComposer.render();
};
window.addEventListener('resize', OnResize);

var UpdateLoop = function ( )
{
    var time = performance.now();
    var delta = (time - prevTime)/1000;
    prevTime = time;


    VILLAGER.update(delta);
    COOKING.update(delta);
    FARMING.update();
    PLAYER.update(delta);
    ENVIRONMENT.update(delta);
    //renderer.render(scene,getCamera());
    effectComposer.render()
    requestAnimationFrame(UpdateLoop);
};

function isGameOver(){
    return gameOver;
}

function endGame(){
    gameOver = true;
    gameOverText.style.opacity = 1;
    gameOverText.textContent = "Game Over, Survived "+daysSurvived+" days, reload to play again"
}

function addDay(){
    daysSurvived += 1;
}
//INVENTORY.testInventory();

requestAnimationFrame(UpdateLoop);

export{getScene, getDoc, getWindow, getColliders, addCollider, removeCollider, isGameOver, endGame, addDay};
