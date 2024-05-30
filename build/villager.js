import * as THREE from 'three';
import {getScene, getDoc, getColliders, addCollider, removeCollider} from '../main.js';
import {addItem, deleteItem, getItemAmount, printInventory} from './inventory.js';
import {getBrightness} from './environment.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';

var timer = 0;

var doc = getDoc();

var villagers = [];

const prod = ["Bread","Carrot Cake", "Potato Wedges", "Cornflakes", "Currency"];
const curval = [10, 6, 4, 8,1];

var ticket = 0;

const villlist = [];

var availableSpots = [true,true,true,true];

var spawnTimer = 5;

const loader = new GLTFLoader();
function createVilltest() {
    loader.load(
        // resource URL
        'build/models/Villager.gltf',
        //called when the resource is loaded
        function ( gltf ) {
            console.log(gltf.scene);
            gltf.scene.position.z += 17;
            gltf.scene.position.x += 23;
            var i = Math.floor(Math.random()*4);
            while(!availableSpots[i]){
                i = Math.floor(Math.random()*4);
            }
            availableSpots[i] = false;
            gltf.scene.position.x += i;
            gltf.scene.position.y += 0.5;
            gltf.scene.traverse(function(object){
                object.name = "Villager";
                object.userData.parent = gltf.scene;     
            });

            //gltf.scene.scale.multiplyScalar(4);
            addCollider( gltf.scene );

            establishTrade(gltf.scene);
            villagers.push(gltf.scene);
        },
        // called while loading is progressing
        // function ( xhr ) {
    
        //     console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        // },
        // // called when loading has errors
        // function ( error ) {
    
        //     console.log( error );
    
        // }
    );
}



function establishTrade(sphere) {
	var giveItem = prod.length-1;
	var receiveItem = Math.floor(Math.random()*(prod.length-1));

	
	var receiveAmount = Math.floor(Math.random()*3)+1;
	
	
	var giveAmount = receiveAmount*curval[receiveItem];
   
    sphere.userData = [giveAmount, giveItem, receiveAmount, receiveItem,];
ticket +=1;
}


var current;
function changeText(villager) {
    var arr = villager.userData;
    console.log(arr);
    var tex = doc.getElementById("villagertext");
    var opaq = doc.getElementById("villagertext");
    if (opaq.style.opacity < 0.5) {
    tex.textContent = "I will give you " + arr[0] + " " + prod[arr[1]] + " for " + arr[2] + " " + prod[arr[3]];
    timer = 2;

    current = arr;
    }
    if (opaq.style.opacity >0.5&&current==arr) {
        if (getItemAmount(prod[arr[3]]) >= arr[2]) {
            tex.textContent = "Thanks for the Trade \n NO REFUNDS"
            addItem(prod[arr[1]], arr[0]);
            deleteItem(prod[arr[3]], arr[2]);
            console.log(printInventory());
            removeCollider(villager);
            var i = villager.position.x - 23;
            availableSpots[i] = true;

        }else {
            tex.textContent = "You dont have enough " + prod[arr[3]];
        }

    }
}



function updateText(delta){
    timer -= delta;

    var opaq = doc.getElementById("villagertext");
    opaq.style.opacity = timer/2;
}

function updatePos(vill) {
    var x = (Math.floor(Math.random)*2)-1;
    var y = (Math.floor(Math.random)*2)-1;

    const raycaster = new THREE.Raycaster();
    
    const startPos = new THREE.Vector3(sphere.position.x, sphere.position.y + height, sphere.position.z);
    
    const direction = new THREE.Vector3(x, 0, y).normalize();
    
    raycaster.set(startPos, direction);
    
    const scene = getScene();
    const objectsToCheck = scene.children;
    
    const intersects = raycaster.intersectObjects(objectsToCheck, true);
    
    if (intersects.length === 0 || intersects[0].distance > Math.sqrt(x * x + y * y)) {
        sphere.position.x += x;
        sphere.position.y += y;
        
        // Ensure the sphere stays within certain bounds (if needed)
        // sphere.position.x = Math.max(0, Math.min(10, sphere.position.x));
        // sphere.position.y = Math.max(0, Math.min(10, sphere.position.y));
    } else {
       
        console.log('Collision detected, position not updated.');
    }


}



function getDownIntersects(vill) {

    var worldPos = new THREE.Vector3();
    vill.getWorldPosition(worldPos);


    var downDirection = new THREE.Vector3(0, -1, 0);

    var downRay = new THREE.Raycaster(worldPos, downDirection);

    var colliders = getColliders();
    var intersects = downRay.intersectObjects(colliders, true);
    // console.log(intersects);
    return intersects;
}

function setup(){
    for(var i = 0; i < 4; i++){
        createVilltest();
    }
}

var checker = 0;
function update(delta){
    if (timer >0) {
        updateText(delta);
    }
    
    if(availableSpots.filter(x => x==true).length == 0){
        return;
    }
    
    spawnTimer -= delta;
    if(spawnTimer <= 0){
        spawnTimer += 5;
        createVilltest();
    }
        
}


export{timer};
export{createVillager};
export{updateText};
export{update};
export{changeText};
export{setup};
