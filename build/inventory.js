import * as THREE from 'three';
import {getScene, getDoc, endGame, addDay} from '../main.js';
//import {addItem} from './interaction.js';
//import {deleteItem} from './interaction.js';

class Item {
    constructor(name, amount){
        this.name = name;
        this.amount = amount;
    }

    increaseAmount(add){
        this.amount += add;
    }

    decreaseAmount(minus){
        this.amount -= minus;
    }
}

var scene = getScene();
var inventoryList = [];
var selectedIndex = 0;

var topText = getDoc().getElementById("topInventoryText");
var midText = getDoc().getElementById("midInventoryText");
var bottomText = getDoc().getElementById("bottomInventoryText");

var currencyText = getDoc().getElementById("currencyText");
var rentText = getDoc().getElementById("rentText");

var currency = new Item('Currency', 0);

var rentGoal = 10;

function onDayEnd(){
    if(currency.amount < rentGoal){
        gameOver();
        return;
    }
    currency.amount -= rentGoal;
    rentGoal += 5;
    updateCurrencyText();
    addDay();

}

function gameOver(){
    endGame();
}

function addCurrency(amount){
    currency.amount += amount;
    updateCurrencyText();
}

function removeCurrency(amount){
    currency.amount -= amount;
    updateCurrencyText();
}

function updateCurrencyText(){
    currencyText.textContent = "$"+currency.amount;
    rentText.textContent = "Next Rent: $"+rentGoal;
}

function addItem(name, amount){
    if(name == 'Currency'){
        addCurrency(amount);
        return;
    }
    var i = getIndexOfItem(name);
    if(i == -1){
        inventoryList.push(new Item(name, amount));
        updateText();
        return;
    }
    inventoryList[i].increaseAmount(amount);
    
    updateText();
}

function deleteItem(name, amount){
    if(name == 'Currency'){
        removeCurrency(amount);
        return;
    }
    var i = getIndexOfItem(name);
    if(i == -1){
        console.log("No "+name+" in inventory")
        return;
    }
    var item = inventoryList[i];

    if(item.amount >= amount){
        item.decreaseAmount(amount);
        if(item.amount == 0){
            inventoryList.splice(i,1);
            if(selectedIndex >= i){
                decreaseSelection();
            }
        }
    }
    else{
        console.log("Not enough of "+name);
    }
    updateText();
}

function getItemAmount(name){
    if(name == currency){
        return currency.amount;
    }
    return getItemByName(name).amount;
}

function getItemByName(name){
    if(name == 'Currency'){
        return currency;
    }
    var i = getIndexOfItem(name);
    if(i == -1){
        return new Item('Empty', 0);
    }
    return inventoryList[i];
}

function inventoryContains(name){
    if(name == 'Currency'){
        return true;
    }
    if(getIndexOfItem(name) == -1){
        return false;
    }
    return true;
}

function getIndexOfItem(name){ 
    var i = 0;
    for(var item of inventoryList){
        if(item.name == name){
            return i;
        }
        i++;
    }
    return -1;
}

function setup(scene){
    addItem("Wheat Seeds", 5)
    addItem("Carrot", 5)
    addItem("Corn Seeds", 5)
    addItem("Potato", 5)
}

function updateText(){
    var currentItem = getItemAt(selectedIndex);
    var prevIndex = selectedIndex -1;
    if(prevIndex < 0){
        prevIndex = inventoryList.length-1;
    }
    var prevItem = getItemAt(prevIndex);
    var nextIndex = selectedIndex +1;
    if(nextIndex >= inventoryList.length){
        nextIndex = 0;
    }
    var nextItem = getItemAt(nextIndex);
    midText.textContent = currentItem.name + ' : '+currentItem.amount;
    bottomText.textContent = prevItem.name + ' : '+prevItem.amount;
    topText.textContent = nextItem.name + ' : '+nextItem.amount;
}

function getItemAt(index){
    if(index < 0 || index >= inventoryList.length){
        return new Item('Empty',0);
    }
    return inventoryList[index];
}

function getCurrentItem(){
    if(inventoryList.length == 0){
        return new Item('Empty', 0);
    }
    if(selectedIndex >= inventoryList.length){
        selectedIndex = inventoryList.length-1;
    }
    if(selectedIndex < 0){
        selectedIndex = 0;
    }
    return inventoryList[selectedIndex];
}

function increaseSelection(){
    selectedIndex += 1;
    if(selectedIndex >= inventoryList.length){
        selectedIndex = 0;
    }
    console.log(selectedIndex);
    updateText();
}

function decreaseSelection(){
    selectedIndex -= 1;
    if(selectedIndex < 0){
        if(inventoryList.length != 0){
            selectedIndex = inventoryList.length-1;
        }
        else{
            selectedIndex = 0;
        }
    }
    console.log(selectedIndex);
    updateText();
}

function printInventory(){
    var text = '';
    for(var i = 0; i < inventoryList.length; i++){
        if(inventoryList[i] != null){
            text += inventoryList[i].name + ": " + inventoryList[i].amount + '\n';
        }else{
            text += 'empty\n';
        }
    }
    return text;
}

function testInventory(){
    inventoryList.push(new Item('Wheat', 5), new Item('Seeds', 4), new Item('Bread', 2));
    console.log(printInventory());
    addItem('Seeds', 10);
    console.log(printInventory());
    deleteItem('Wheat', 2);
    console.log(printInventory());
    deleteItem('Bread', 2);
    console.log(printInventory());
    deleteItem('Bread', 2);
    console.log(printInventory());
    addItem('Bread', 10);
    console.log(printInventory());
}

export{testInventory};
export{setup, addItem, deleteItem, printInventory, getItemAmount, getItemByName, inventoryContains, getIndexOfItem, getCurrentItem, increaseSelection, decreaseSelection, onDayEnd, addCurrency, removeCurrency};
