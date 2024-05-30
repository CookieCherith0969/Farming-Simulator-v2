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

const loader = new GLTFLoader();
function createVillager() {
    loader.load(
        // resource URL
        'build/models/Villager.gltf',
        //called when the resource is loaded
        function ( gltf ) {
            console.log(gltf.scene);
            gltf.scene.position.z += 17;
            gltf.scene.position.y += 0.5;
            gltf.scene.position.x += 23;

            var i = Math.floor(Math.random()*4);
            while(!availableSpots[i]){
                i = Math.floor(Math.random()*4);
            }

            availableSpots[i] = false;
            gltf.scene.position.x += i;

            gltf.scene.traverse(function(object){
                object.name = "Villager";
                object.userData.parent = gltf.scene;     
            });

            //gltf.scene.scale.multiplyScalar(4);
            addCollider( gltf.scene );

            establishTrade(gltf.scene);
            villagers.push(gltf.scene);
        }
    );
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
    if(spawnTimer <= 0){
        spawnTimer += spawnDelay;
        createVillager();
    }
        
}

export{createVillager};
export{update};
export{tryTrade};
export{setup};
