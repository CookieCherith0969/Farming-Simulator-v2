import * as THREE from 'three';
import {getScene, getDoc, getColliders, addCollider, removeCollider} from '../main.js';
import {addItem, deleteItem, getItemAmount, printInventory} from './inventory.js';
import {getBrightness} from './environment.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';

var popupDuration = 2;
var textTimer = 0;

var villagers = [];

const products = ["Bread","Carrot Cake", "Potato Wedges", "Cornflakes", "Currency"];
const productValues = [10, 6, 4, 8,1];

var availableSpots = [true,true,true,true];

var spawnDelay = 5;
var spawnTimer = spawnDelay;

var tradeText = getDoc().getElementById("villagertext");

var activeTrader = new THREE.Object3D();

var villagerModel = new THREE.Object3D();
var modelReady = false;

const loader = new GLTFLoader();
function createVillager() {
    var newVillager = villagerModel.clone(true);

    var i = Math.floor(Math.random()*4);
    while(!availableSpots[i]){
        i = Math.floor(Math.random()*4);
    }

    availableSpots[i] = false;
    newVillager.position.x += i;

    newVillager.traverse(function(object){
        object.userData.parent = newVillager;     
    });

    //gltf.scene.scale.multiplyScalar(4);
    addCollider( newVillager );

    establishTrade(newVillager);
    
}



function establishTrade(villager) {
	var receiveItem = Math.floor(Math.random()*(products.length-1));
	
	var receiveAmount = Math.floor(Math.random()*3)+1;
	
	var giveAmount = receiveAmount*productValues[receiveItem];
   
    villager.userData = {giveAmount:giveAmount, receiveAmount:receiveAmount, receiveItem:receiveItem};
}


function tryTrade(villager){
    var trade = villager.userData;
    if(tradeText.style.opacity < 0.5){
        tradeText.textContent = "I will give you $"+trade.giveAmount+" for "+trade.receiveAmount+" "+products[trade.receiveItem];
        textTimer = popupDuration
        activeTrader = villager;
        
        return;
    }
    if(activeTrader != villager){
        return;
    }

    if (getItemAmount(products[trade.receiveItem]) >= trade.receiveAmount) {
        tradeText.textContent = "Thanks for the Trade \n NO REFUNDS"
        addItem("Currency", trade.giveAmount);
        deleteItem(products[trade.receiveItem], trade.receiveAmount);
        removeCollider(villager);
        var i = villager.position.x - 23;
        availableSpots[i] = true;
    }
    else {
        tradeText.textContent = "You dont have enough " + products[trade.receiveItem];
    }
}

function setup(){
    // for(var i = 0; i < 4; i++){
    //     createVillager();
    // }
    loader.load(
        // resource URL
        'build/models/Villager.gltf',
        //called when the resource is loaded
        function ( gltf ) {
            gltf.scene.position.z += 17;
            gltf.scene.position.y += 0.5;
            gltf.scene.position.x += 23;

            gltf.scene.traverse(function(object){
                object.name = "Villager"; 
            });

            villagerModel = gltf.scene;
            modelReady = true;
        }
    );
}

function update(delta){
    if (textTimer >0) {
        textTimer -= delta;

        tradeText.style.opacity = textTimer/popupDuration;
    }
    
    if(availableSpots.filter(x => x==true).length == 0){
        return;
    }
    
    spawnTimer -= delta;
    if(spawnTimer <= 0 && modelReady){
        spawnTimer += spawnDelay;
        createVillager();
    }
        
}

export{createVillager};
export{update};
export{tryTrade};
export{setup};
