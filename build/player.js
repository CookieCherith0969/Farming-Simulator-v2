import * as THREE from 'three';
import {getScene, getDoc, getWindow, getColliders, isGameOver} from '../main.js';
import { PointerLockControls } from '../build/controls/PointerLockControls.js';
import { handleInteraction } from './interaction.js';
import { changeTime, getTime } from './environment.js';
import { increaseSelection, decreaseSelection } from './inventory.js';

var controls, camera;
var raycaster = new THREE.Raycaster();

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var jumpUp = false;

var prevTime = performance.now();
var horDirection = new THREE.Vector2();
var horVelocity = new THREE.Vector2();
var verVelocity = 0.0;
const speed = 3.0;
const jumpPower = 5.0;
const gravity = 9.8;

const width = 0.3;
const height = 1.6;
const interactRange = 2.5;

var worldUp = new THREE.Vector3(0,1,0);
var worldDown = new THREE.Vector3(0,-1,0);
var worldLeft = new THREE.Vector3(-1,0,0);
var worldRight = new THREE.Vector3(1,0,0);
var worldForward = new THREE.Vector3(0,0,1);

var spawnPos = new THREE.Vector2(25,25);

var downRay = new THREE.Raycaster();
var frontRay = new THREE.Raycaster();

const killPlaneHeight = -10;

function setup(){
    var ratio = getWindow().innerWidth/getWindow().innerHeight;
    camera = new THREE.PerspectiveCamera(70,ratio,0.2,70);

    var Pos = new THREE.Vector3(spawnPos.x,height+1,spawnPos.y);
    camera.position.set(Pos.x,Pos.y,Pos.z);
    camera.lookAt(Pos.x,Pos.y,Pos.z+1);

    controls = new PointerLockControls( camera, getDoc().body );
    controls.maxPolarAngle = 0.99 * Math.PI;
    controls.minPolarAngle = 0.01 * Math.PI;
    getScene().add(controls.getObject());

    downRay.far = height;
    frontRay.far = width;
    raycaster.far = interactRange;

    function onKeyDown( event ) {

        switch ( event.keyCode ) {
            case 32: //Spacebar
                //if(getDownIntersects().length != 0){
                //    jumpUp = true;
                //}
                break;

            case 17: //Control
                controls.lock();
                break;

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                  break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 86: // v
                break;
            case 84: // t
                //changeTime((getTime() + 50)%2359);
                break;
            case 89: // y
                //changeTime((getTime() - 50)%2359);
                break;
            case 81: // q
                increaseSelection();
                break;
            case 69: // e
                decreaseSelection();
                break;
        }
    }
    
    function onKeyUp( event ) {
    
        switch( event.keyCode ) {
            case 32: //Spacebar
                break;
            case 17: //Control
                break;
                
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
    
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
    
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
    
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
    
        }
    }

    function onMouseDown( event ) {

        var center = new THREE.Vector2;
        center.x = 0;
        center.y = 0;

        raycaster.setFromCamera( center, camera );

        var intersects = raycaster.intersectObjects( getScene().children, true );

        if ( intersects.length > 0 ) {
            var target = intersects[ 0 ].object;
            handleInteraction(target);
        }
     }

     // when the mouse is clicked, call the given function
    getDoc().addEventListener( 'mousedown', onMouseDown, false );
    
    getDoc().addEventListener( 'keydown', onKeyDown, false );
	getDoc().addEventListener( 'keyup', onKeyUp, false );
}

function update(delta){
    if(isGameOver()){
        controls.unlock();
        return;
    }
    horDirection.setY(0);
    horDirection.setX(0);

    if(jumpUp){
        jumpUp = false;
        verVelocity += jumpPower;
    }

    if(moveForward){
        horDirection.y += 1;
    }
    if(moveBackward){
        horDirection.y -= 1;
    }
    if(moveRight){
        horDirection.x += 1;
    }
    if(moveLeft){
        horDirection.x -= 1;
    }
    horDirection.normalize();
    horVelocity = horDirection;
    horVelocity.multiplyScalar(speed);
    
    if(!horDirection.equals(new THREE.Vector2(0,0))){
        var frontIntersects = getFrontIntersects();
        if(frontIntersects.length == 0){
            controls.moveForward( horVelocity.y * delta );
            controls.moveRight( horVelocity.x * delta );
        }
        else{
            var diff = width - frontIntersects[0].distance;
            horDirection.negate();
            horDirection.multiplyScalar(diff);
            controls.moveForward( horDirection.y );
            controls.moveRight( horDirection.x );
        }
    }

    if(verVelocity != 0.0){
        translateOnWorldUp(getCamera(), verVelocity*delta);
    }
    var downIntersects = getDownIntersects();

    if(downIntersects.length == 0){
        verVelocity -= gravity * delta;
    }
    else{
        var diff = height - downIntersects[0].distance;
        translateOnWorldUp(getCamera(), diff-0.0001)
        verVelocity = 0.0;
    }

    var worldPos = new THREE.Vector3();
    getCamera().getWorldPosition(worldPos);
    if(worldPos.y < killPlaneHeight){
        translateOnWorldUp(getCamera(), -killPlaneHeight*2);
        translateOnWorldAxis(getCamera(), worldRight, -worldPos.x+spawnPos.x);
        translateOnWorldAxis(getCamera(), worldForward, -worldPos.z+spawnPos.y);
        verVelocity = 0.0;
    }
    else if(worldPos.x < spawnPos.x-7 || worldPos.x > spawnPos.x+6 || worldPos.z < spawnPos.y-7.5 || worldPos.z > spawnPos.y+9.5){
        translateOnWorldUp(getCamera(), 2);
        translateOnWorldAxis(getCamera(), worldRight, -worldPos.x+spawnPos.x);
        translateOnWorldAxis(getCamera(), worldForward, -worldPos.z+spawnPos.y);
    }

    //if(downIntersects.length != 0 && verVelocity == 0){
    //    return;
    //}

    //translateOnWorldUp(getCamera(), verVelocity*delta);

    //downIntersects = getDownIntersects();
    //if(downIntersects.length != 0){
    //    var diff = height - downIntersects[0].distance;
    //    translateOnWorldUp(getCamera(), diff)
    //    verVelocity = 0.0;
    //}
    //else{
    //    verVelocity -= gravity * delta;
    //}

    //var footHeight = worldPos.y - height;
    //if(footHeight < tempGroundHeight){
    //    console.log("hit ground");
    //    grounded = true;
    //    verVelocity = 0;
    //    var diff = tempGroundHeight - footHeight;

    //    getCamera().getWorldPosition(worldPos);
    //    localUp = getCamera().worldToLocal(worldPos.add(worldUp));

    //    getCamera().translateOnAxis(localUp, diff);
    //}
    //else{
    //    verVelocity -= gravity * delta;
    //}


};

function getMoveDir(){
    var worldDir = new THREE.Vector3();
    getCamera().getWorldDirection(worldDir);
    worldDir.setY(0);
    worldDir.normalize();

    var horRot = worldDir.angleTo(worldLeft) - Math.PI/2 + horDirection.angle();
    //console.log(worldDir.angleTo(worldLeft));
    //console.log(horDirection.angle());
    var moveDir = new THREE.Vector3(-1,0,0);
    moveDir.applyAxisAngle(worldUp,horRot);
    return moveDir;
}

function getFrontIntersects(){
    var worldPos = new THREE.Vector3();
    getCamera().getWorldPosition(worldPos);
    worldPos.y -= 1.2;

    var moveDir = getMoveDir();

    frontRay.set(worldPos, moveDir);
    
    var intersects = frontRay.intersectObjects( getColliders(), true );

    return intersects;
}
function getDownIntersects(){
    var worldPos = new THREE.Vector3();
    getCamera().getWorldPosition(worldPos);

    downRay.set(worldPos, worldDown);
    var intersects = downRay.intersectObjects( getColliders(), true);

    return intersects;
}

function translateOnWorldUp(obj, distance){
    var worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    var above = worldPos.add(worldUp);

    var localUp = obj.worldToLocal(above);

    obj.translateOnAxis(localUp, distance);
}

function translateOnWorldAxis(obj, axis, distance){
    var worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    var offset = worldPos.add(axis);

    var localDir = obj.worldToLocal(offset);

    obj.translateOnAxis(localDir, distance);
}

function getCamera(){
    return controls.getObject();
}

export{setup, update, getCamera};