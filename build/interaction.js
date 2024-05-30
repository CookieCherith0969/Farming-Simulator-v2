import * as THREE from 'three';
import {getDoc, getScene} from '../main.js';
import {changeText} from './villager.js';
import {addItem, deleteItem, printInventory, getCurrentItem,getItemAmount, removeCurrency} from './inventory.js';
import { isSeed, cropToSeed, seedToCrop, addCrop, removeCrop, wetPlot, loadStage,isCrateActive,getCurrentCrate,setActiveCrate} from './farming.js';
import { closeAnim, openAnim} from './cooking.js';
// Uses object name to select which interaction function to call
function handleInteraction(object){
    console.log(object.name);
    console.log(object.userData);
    switch(object.name){
        /*case "Dirt":
            dirtInteraction(object);
            break;
        case "Grass":
            grassInteraction(object);
            break;*/
        case "Villager":
            villagerInteraction(object.userData.parent);
            break;
        case "Crop":
            cropInteraction(object.userData.parent);
            break;
        case "Plot":
            plotInteraction(object);
            break;
        case "Oven":
            ovenInteraction(object.userData.parent);
            break;
        case "Crate":
            crateInteraction(object.userData.parent);
            break;
    }
}
function crateInteraction(object){
    var info = object.userData;

    if(!isCrateActive()){
        setActiveCrate(object);
        return;
    }
    if(getCurrentCrate() != object){
        return;
    }
    if(getItemAmount("Currency") >= info.cost){
        removeCurrency(info.cost);
        addItem(info.seed,1);
    }
}

function villagerInteraction(object){
    var doc = getDoc();
    var villtext = doc.getElementById("villagertext");
    changeText(object);
}
/*function dirtInteraction(object){
    object.material.color = new THREE.Color(0,0.8,0.15);
    object.name = "Grass";
}
function grassInteraction(object){
    object.material.color = new THREE.Color(0.50,0.25,0);
    object.name = "Dirt";
}*/
function cropInteraction(object){
    var info = object.userData;
    if(info.currentGrowth < info.growthTime){
        if(info.waterTime <= 0){
            var prevGrowth = info.currentGrowth;
            info.currentGrowth += 10;
            info.waterTime = 10;
            wetPlot(info.plot);

            if(info.currentGrowth >= info.growthTime){
                loadStage(object, 3);
            }
            else if(info.currentGrowth >= info.growthTime/2 && prevGrowth < info.growthTime/2){
                loadStage(object,2);
            }
        }
        return;
    }
    var cropType = info.type;
    var cropRange = info.maxCrop - info.minCrop;
    var seedRange = info.maxSeed - info.minSeed;
    var cropAmount = Math.floor(Math.random()*(cropRange+1))+info.minCrop;
    var seedAmount = Math.floor(Math.random()*(seedRange+1))+info.minSeed;
    addItem(cropType,cropAmount);
    addItem(cropToSeed(cropType),seedAmount);
    removeCrop(object);
    console.log("removed");
}

function plotInteraction(object){
    var info = object.userData;
    if(info.planted){
        return;
    }
    var currentItem = getCurrentItem()
    if( isSeed(currentItem.name) ){
        var cropType = seedToCrop(currentItem.name);
        addCrop(object, cropType);
        deleteItem(currentItem.name,1);
        info.planted = true;
    }
}

function ovenInteraction(object){
    if(object.userData.cookTime > 0){
        return;
    }
    if(object.userData.ready){
        addItem(object.userData.outputName,object.userData.outputAmount);
        object.userData.ready = false;
        openAnim(object);
        return;
    }
    var currentItem = getCurrentItem()
    switch(currentItem.name){
        case 'Wheat':
            if(currentItem.amount >= 3){
                deleteItem(currentItem.name, 3);
                object.userData.cookTime = 20.0;
                object.userData.outputName = 'Bread';
                object.userData.outputAmount = 1;
                closeAnim(object);
            }
            break;
        case 'Carrot':
            if(currentItem.amount >= 6){
                deleteItem(currentItem.name, 6);
                object.userData.cookTime = 15.0;
                object.userData.outputName = 'Carrot Cake';
                object.userData.outputAmount = 1;
                closeAnim(object);
            }
            break;
        case 'Potato':
            if(currentItem.amount >= 4){
                deleteItem(currentItem.name, 4);
                object.userData.cookTime = 10.0;
                object.userData.outputName = 'Potato Wedges';
                object.userData.outputAmount = 1;
                closeAnim(object);
            }
            break;
        case 'Corn':
            if(currentItem.amount >= 3){
                deleteItem(currentItem.name, 3);
                object.userData.cookTime = 15.0;
                object.userData.outputName = 'Cornflakes';
                object.userData.outputAmount = 1;
                closeAnim(object);
            }
            break;
    }
}

export{handleInteraction};