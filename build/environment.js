import * as THREE from 'three';
import {getScene, getMTLLoader, getOBJLoader, getFBXLoader, addCollider, isGameOver} from '../main.js';
import { onDayEnd } from './inventory.js';
import { GLTFLoader} from './loaders/GLTFLoader.js';



var n = 50;
var cropSize = 3;
var sun;
var moon;
var daylight;
var minDaylight = 0.0;
var maxDaylight = 0.9;
var maxSun = 0.8;
var maxMoon = 0.3;
var sunColor = 0xffffff;
var moonColor = 0x6666ff;
var currentTime = 0;
const dayLength = 90;
var heightVariation = 0.2;
var type;
var workspaceWidth = 18;
var workspaceDepth = 14;

function getWidth(){
    return n;
}

var grounds = [];
var fields = [];

function changeTime(num){
    //console.log(currentTime);
    //console.log(num);
    //Brightness ranges from 0-1
    //Brightness linearly increases for the first half of the day (midnight-noon)
    //Brightness linearly decreases for the second half of the day (noon-midnight)
    var brightness = getBrightness();

    var angle = THREE.MathUtils.degToRad(((num/dayLength)*360)-90);
    var angleMoon = THREE.MathUtils.degToRad(((num/dayLength)*360)+90);

    var radius =n+1;
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;

    var xM = Math.cos(angleMoon) * radius;
    var yM = Math.sin(angleMoon) * radius;

    //update position of the directional light
    sun.position.set(x,y,n/2);
    moon.position.set(xM,yM,n/2);

    sun.intensity = brightness*maxSun;
    moon.intensity = (1-brightness)*maxMoon;

    var daylightRange = maxDaylight-minDaylight;
    daylight.intensity = brightness*daylightRange+minDaylight;
    daylight.color.lerpColors(moon.color, sun.color, brightness);
    currentTime = num;
}

function getTime(){
    return currentTime;
}

function getBrightness(){
    var brightness = currentTime/dayLength
    if(brightness>0.5){
        brightness = 0.5 - (brightness-0.5);
    }
    brightness *= 2;
    return brightness;
}

function addTime(delta){
    currentTime += delta;
    if(currentTime > dayLength){
        currentTime -= dayLength;
        onDayEnd();
    }
    changeTime(currentTime);
}

function setup(){   
    var grassColor = new THREE.Color(0,0.8,0.15);
    var dirtColor = new THREE.Color(0.50,0.25,0);

    var width = 1;
    var ground_geometry = new THREE.BoxGeometry(width,1,width);
    var ground_material = new THREE.MeshLambertMaterial();
    ground_material.color = grassColor;

    for(var i = 0; i<(n*n); i++){
        var ground_material = new THREE.MeshLambertMaterial();
        ground_material.color = new THREE.Color(0,0.8,0.15);
        grounds[i] = new THREE.Mesh(ground_geometry, ground_material);
        grounds[i].name = "Grass";
    }
    var counter = 0;
    var center = n/2;
    var halfWidth = workspaceWidth/2;
    var halfDepth = workspaceDepth/2;
    for(var z = 0; z<n; z++){
        for(var x = 0; x<n; x++){
            if(z > center-halfWidth && z <= center+halfWidth && x >= center-halfDepth && x < center+halfDepth){
                depth = 0
                //console.log("Zero at: "+x+", "+z);
            }
            else{
                var depth = Math.random()*heightVariation;
            }
            //var depth = Math.random()*heightVariation;

            grounds[counter].position.z = z;
            grounds[counter].position.x = x;
            grounds[counter].position.y = depth;
            grounds[counter].castShadow = true;
            grounds[counter].receiveShadow = true;
            addCollider(grounds[counter]);
            counter++;
        }
    }
    /*var houseN = 5;
    var houses = [];

    for(var i = 0; i<houseN; i++){
        getMTLLoader().setPath('build/models/')
        getMTLLoader().load('house.mtl', function(materials){
            materials.preload();
            getOBJLoader().setMaterials(materials)
            getOBJLoader().setPath('build/models/')
            getOBJLoader().load('house.obj', function(object){
                var texture = new THREE.TextureLoader().load('build/models/house.png');
                object.traverse(function(child){
                    if(child instanceof THREE.Mesh && child.material){
                        child.material.map = texture;
                    }
                });
                object.position.x = Math.floor(Math.random()*n);
                object.position.y = -2;
                object.position.z = Math.floor(Math.random()*n);
                object.rotation.y = Math.floor(Math.random()*4)*Math.PI/2;
                var box3 = new THREE.Box3();
                box3.setFromObject(object);
                var CenterBB = new THREE.Vector3();
                var SizeBB = new THREE.Vector3();
                box3.getCenter(CenterBB);
                box3.getSize(SizeBB);
                var boundHelper = new THREE.Box3Helper(box3, 0xffff00);
                getScene().add(boundHelper);
                getScene().add(object);
                houses[i] = object;
                console.log("Houses[i]: "+houses[i].position.x);
            })
        })
    }
    getFBXLoader().load('build/models/crops-low-poly/source/UnitedCrops/Crops/Crops.fbx', (object) => {
        console.log(object);
        object.position.y=1;
        object.scale.multiplyScalar(0.01);
        getScene().add(object);
    });*/
    //adding a silly workplace
    var loader = new GLTFLoader();
    loader.load(
        'build/models/Workspace.gltf',
        //called when the resources is loaded
        function(gltf){
            gltf.scene.name = "Workspace";
            gltf.scene.position.z +=n/2-7;
            gltf.scene.position.x +=n/2;
            gltf.scene.position.y +=0.5;
            addCollider(gltf.scene);
            gltf.scene.traverse(function(object){
                object.name = "Workspace";
                object.userData.parent = gltf.scene;
            });
            //gltf.scene.userData = structuredClone(data[0]);
        }
    )

    
    

    sun = new THREE.SpotLight(sunColor, 0.8);
    sun.position.set(n/2, n+1, n/2);
    sun.penumbra =1;
    sun.target = grounds[grounds.length/2];
    sun.castShadow = true;
    sun.decay = 0;
    getScene().add(sun);

    moon = new THREE.SpotLight(moonColor, 0.3);
    moon.decay = 0;
    getScene().add(moon);
    daylight = new THREE.AmbientLight(0xffffff, 0.9);
    getScene().add(daylight);
    changeTime(0);

    
    function makeDirt(){
        var x = Math.floor(Math.random()*(n-2));
        var y = Math.floor(Math.random()*(n-2));
        counter = y*n+x;
        //var counter = Math.floor(Math.random() * ((n*n)-(cropSize*cropSize)-cropSize));
        var dirtHeight = grounds[counter].position.y;
        console.log(counter);
        
        for(var i = 0; i<cropSize; i++){
            for(var j = 0; j < cropSize; j++){
                grounds[counter].material.color = dirtColor;
                grounds[counter].position.y = dirtHeight;
                grounds[counter].name = "Plot";
                grounds[counter].userData = {planted: false};
                fields.push(grounds[counter]);
                counter++;
            }
            counter +=(n-cropSize);
        }
    }

    function makeDirtAt(pos){
        counter = pos.y*n+pos.x;
        //var counter = Math.floor(Math.random() * ((n*n)-(cropSize*cropSize)-cropSize));
        var dirtHeight = grounds[counter].position.y;
        
        for(var i = 0; i<cropSize; i++){
            for(var j = 0; j < cropSize; j++){
                grounds[counter].material.color = dirtColor;
                grounds[counter].position.y = dirtHeight;
                grounds[counter].name = "Plot";
                grounds[counter].userData = {planted: false};
                fields.push(grounds[counter]);
                counter++;
            }
            counter +=(n-cropSize);
        }
    }

    makeDirtAt(new THREE.Vector2(26,29)); 
    makeDirtAt(new THREE.Vector2(21,29)); 
    makeDirtAt(new THREE.Vector2(26,24)); 
    makeDirtAt(new THREE.Vector2(21,24)); 
};

function update(delta){
    if(isGameOver()){
        return;
    }
    addTime(delta);
}

export{setup, changeTime, getTime, update, getBrightness, getWidth};