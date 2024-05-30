import * as THREE from 'three';
import {getScene, addCollider, getDoc} from '../main.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';


var crops = ["Wheat"      ,"Carrot","Potato","Corn"      ];
var seeds = ["Wheat Seeds","Carrot","Potato","Corn Seeds"]

var dryColor = new THREE.Color(0.50,0.25,0);
var wetColor = new THREE.Color(0.30,0.15,0.05);

var wheat1; var wheat2; var wheat3;
var carrot1; var carrot2; var carrot3;
var potato1; var potato2; var potato3;
var corn1; var corn2; var corn3;

const loader = new GLTFLoader();

var crateText = getDoc().getElementById("crateText");
var currentCrate = new THREE.Object3D();

var stats = [
{type:"Wheat",growthTime:60.0, currentGrowth: 0.0, minSeed:0,maxSeed:2,minCrop:1,maxCrop:3,waterTime:0.0},
{type:"Carrot",growthTime:20.0, currentGrowth: 0.0, minSeed:0,maxSeed:0,minCrop:2,maxCrop:4,waterTime:0.0},
{type:"Potato",growthTime:20.0, currentGrowth: 0.0, minSeed:0,maxSeed:0,minCrop:2,maxCrop:4,waterTime:0.0},
{type:"Corn",growthTime:40.0, currentGrowth: 0.0, minSeed:0,maxSeed:2,minCrop:1,maxCrop:3,waterTime:0.0}
]

var activeCrops = []

var prevTime = performance.now();

function cropToSeed(cropName){
    var index = crops.indexOf(cropName);
    return seeds.at(index);
}

function seedToCrop(seedName){
    var index = seeds.indexOf(seedName);
    return crops.at(index);
}

function isSeed(seedName){
    return seeds.includes(seedName);
}

function loadStage(crop, stage){
    if(crop.children.length > 0){
        crop.remove(crop.children[0]);
    }
    loader.load(
        //resource URL
        'build/models/'+crop.userData.type+stage+'.gltf',
        //called when the resource is loaded
        function(gltf){
            crop.add(gltf.scene);
            gltf.scene.traverse(function(object){
                object.name = "Crop";
                object.userData.parent = crop;     
            });
        }
    )
}

function addCrop(plot,cropType){
    var newCrop = new THREE.Group();
    
    newCrop.position.x = plot.position.x;
    newCrop.position.y = plot.position.y+0.5;
    newCrop.position.z = plot.position.z; 
    
    var index = crops.indexOf(cropType);
    newCrop.userData = structuredClone(stats[index]);
    newCrop.userData.plot = plot;

    activeCrops.push(newCrop);
    getScene().add(newCrop);
    loadStage(newCrop, 1);
}


function removeCrop(crop){
    var index = activeCrops.indexOf(crop);
    activeCrops.splice(index,1);
    crop.userData.plot.userData.planted = false;
    dryPlot(crop.userData.plot);
    getScene().remove(crop);
}

function update(){
    var time = performance.now();
    var delta = (time - prevTime)/1000;
    prevTime = time;

    for(var crop of activeCrops){
        if(crop.userData.currentGrowth < crop.userData.growthTime){
            var prevGrowth = crop.userData.currentGrowth;
            crop.userData.currentGrowth += delta;
            if(crop.userData.currentGrowth >= crop.userData.growthTime){
                //Change to final model
                loadStage(crop, 3);
            }
            else if(crop.userData.currentGrowth >= crop.userData.growthTime/2 && prevGrowth < crop.userData.growthTime/2){
                //Change to middle model
                loadStage(crop,2);
            }

        }
        if(crop.userData.waterTime > 0){
            crop.userData.waterTime -= delta;
            if(crop.userData.waterTime <= 0){
                dryPlot(crop.userData.plot);
            }
        }
    }

    if(crateText.style.opacity > 0){
        crateText.style.opacity -= delta/3;
    }
}

function setup(){
    crateText.style.opacity = 0;
    seedCrateAt(new THREE.Vector3(23,0.5,34),'Wheat Seeds',3);
    seedCrateAt(new THREE.Vector3(24,0.5,34),'Corn Seeds',3);
    seedCrateAt(new THREE.Vector3(25,0.5,34),'Carrot',10);
    seedCrateAt(new THREE.Vector3(26,0.5,34),'Potato',10);
}

function isCrateActive(){
    return crateText.style.opacity > 0.25;
}

function getCurrentCrate(){
    return currentCrate;
}

function setActiveCrate(crate){
    currentCrate = crate;
    crateText.style.opacity = 1;
    crateText.textContent = crate.userData.seed+" for $"+crate.userData.cost;
}

function wetPlot(plot){
    plot.material.color = wetColor;
}

function dryPlot(plot){
    plot.material.color = dryColor;
}

function seedCrateAt(pos, seed, cost){
    loader.load(
        //resource URL
        'build/models/Seed Crate.gltf',
        //called when the resource is loaded
        function(gltf){
            addCollider(gltf.scene);
            gltf.scene.traverse(function(object){
                object.name = "Crate";
                object.userData.parent = gltf.scene;     
            });
            gltf.scene.userData = {seed:seed, cost:cost};
            gltf.scene.position.set(pos.x,pos.y,pos.z);
        }
    )
}

export {addCrop, removeCrop, cropToSeed, seedToCrop, isSeed, update, wetPlot, dryPlot, loadStage, setup, isCrateActive,getCurrentCrate,setActiveCrate};