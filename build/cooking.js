import * as THREE from 'three';
import {getScene, addCollider} from '../main.js';
import {getWidth} from './environment.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';

var data = [
    {cookTime:0.0,outputName:'',outputAmount:0,ready:false,smokeTimer:0}, //Oven
    ]

var crops = ["Wheat","Carrot","Potato","Corn"];
var costs = [3, 6, 4, 3];
var times = [20,15,10,15];
var products = ["Bread","Carrot Cake","Potato Wedges","Cornflakes"];
var amounts = [1,1,1,1];

var stationToMixer = new Map();

var activeStations = []

var activeSmoke = []
var smokeColor = new THREE.Color(0.12,0.1,0.1);
var smokeLifetime = 2;
var smokeBuoyancy = 0.5;
var smokeVelocity = 0.5;
var smokeSize = 0.5;
var smokeDelay = 0.5;

var worldUp = new THREE.Vector3(0,1,0);
var worldRight = new THREE.Vector3(1,0,0);

const loader = new GLTFLoader();
function setup(){
    ovenAt(new THREE.Vector3(22,0.5,21));
    //ovenAt(new THREE.Vector3(25,1,21));
    ovenAt(new THREE.Vector3(27,0.5,21));
}

function cropToRecipe(cropType){
    var index = crops.indexOf(cropType);
    return {cost:costs[index],time:times[index],product:products[index],amount:amounts[index]};
}

function ovenAt(pos){
    loader.load(
        // resource URL
        'build/models/Oven.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            gltf.scene.name = "Oven";
            gltf.scene.position.x += pos.x;
            gltf.scene.position.y += pos.y;
            gltf.scene.position.z += pos.z;
            addCollider( gltf.scene );
            activeStations.push(gltf.scene);
            var mixer = new THREE.AnimationMixer( gltf.scene );
            stationToMixer.set(gltf.scene, mixer);
            var clips = gltf.animations; // Array<THREE.AnimationClip>

            var openClip = THREE.AnimationClip.findByName( clips, 'Open' );
            var closeClip = THREE.AnimationClip.findByName( clips, 'Close' );
            var openAction = mixer.clipAction( openClip );
            var closeAction = mixer.clipAction( closeClip );
            openAction.setLoop(THREE.LoopOnce,1);
            closeAction.setLoop(THREE.LoopOnce,1);
            openAction.clampWhenFinished = true;
            closeAction.clampWhenFinished = true;
            gltf.scene.traverse(function(object){
                object.name = "Oven"; 
                object.userData.parent = gltf.scene;
            });
            gltf.scene.userData = structuredClone(data[0]);
            gltf.scene.userData.animations = gltf.animations;
            if(activeStations.length == 1){
                gltf.scene.rotation.y = -Math.PI/2;
            }
            else if(activeStations.length == 2){
                gltf.scene.rotation.y = Math.PI/2;
            }
        }
    );
}

function closeAnim(object){
    var mixer = stationToMixer.get(object);

    var clips = object.userData.animations; // Array<THREE.AnimationClip>

    var openClip = THREE.AnimationClip.findByName( clips, 'Open' );
    var closeClip = THREE.AnimationClip.findByName( clips, 'Close' );

    var openAction = mixer.existingAction(openClip);
    var closeAction = mixer.existingAction(closeClip);

    openAction.weight = 0;
    closeAction.weight = 1;
    closeAction.reset();
    closeAction.play();
}
function openAnim(object){
    var mixer = stationToMixer.get(object);

    var clips = object.userData.animations; // Array<THREE.AnimationClip>

    var openClip = THREE.AnimationClip.findByName( clips, 'Open' );
    var closeClip = THREE.AnimationClip.findByName( clips, 'Close' );

    var openAction = mixer.existingAction(openClip);
    var closeAction = mixer.existingAction(closeClip);

    closeAction.weight = 0;
    openAction.weight = 1;
    openAction.reset();
    openAction.play();
}

function update(delta){
    stationToMixer.forEach(function(value, key, map){
        value.update(delta);
    });
    for(var station of activeStations){
        if(station.userData.cookTime > 0){
            station.userData.cookTime -= delta;
            if(station.userData.cookTime <= 0){
                station.userData.ready = true;
                station.userData.smokeTimer = 0;
            }
        }
        if(station.userData.ready){
            station.userData.smokeTimer+=delta;
            while(station.userData.smokeTimer > smokeDelay){
                createSmoke(station.position);
                station.userData.smokeTimer -= smokeDelay;
            }
        }
    }
    for(var i = activeSmoke.length-1; i >= 0; i--){
        var smoke = activeSmoke[i];
        smoke.mesh.material.opacity -= delta/smokeLifetime;
        if(smoke.mesh.material.opacity <= 0){
            activeSmoke.splice(i,1);
            getScene().remove(smoke);
            continue;
        }
        smoke.mesh.scale.setScalar(smoke.mesh.material.opacity*smokeSize);
        
        smoke.mesh.position.x += smoke.velocity.x*delta;
        smoke.mesh.position.y += smoke.velocity.y*delta;
        smoke.mesh.position.z += smoke.velocity.z*delta;

        smoke.velocity.y += smokeBuoyancy * delta;
    }
}
class Smoke{
    constructor(mesh, velocity){
        this.mesh = mesh;
        this.velocity = velocity;
    }
}
function createSmoke(pos){
    var material = new THREE.MeshBasicMaterial();
    material.color = smokeColor;
    material.transparent = true;

    var geometry = new THREE.TetrahedronGeometry(smokeSize,0);

    var mesh = new THREE.Mesh(geometry,material);

    mesh.position.set(pos.x,pos.y+1,pos.z);
    mesh.rotation.x = Math.random()*2*Math.PI;
    mesh.rotation.y = Math.random()*2*Math.PI;
    mesh.rotation.z = Math.random()*2*Math.PI;

    var spread = Math.random()*90*Math.PI/180;
    var direction = Math.random()*2*Math.PI;

    var velocity = new THREE.Vector3(0,smokeVelocity,0);
    velocity.applyAxisAngle(worldRight, spread);
    velocity.applyAxisAngle(worldUp, direction);

    activeSmoke.push(new Smoke(mesh, velocity));
    getScene().add(mesh);
}

export {setup, update};
export {closeAnim, openAnim, cropToRecipe};