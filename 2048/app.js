import Grid from "./grid.js";
import Tile from "./Tile.js";



    
    const gameBoard = document.getElementById("game-board");

    const grid = new Grid(gameBoard);

    console.log(grid.randomEmptyCell());
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    setupInput(); 

    function setupInput(){
        window.addEventListener("keydown", handleInput, {once: true})
    }

    
    


async function handleInput(e){
    switch(e.key){
        case "ArrowUp":
        case "w":
            if(!canMoveUp()){
                setupInput();
                return;
            }
            await moveUp();
            break;
         case "ArrowDown":
         case "s":
             if(!canMoveDown()){
                setupInput();
                return;
            }
            await moveDown();
            break;
         case "ArrowLeft":
         case "a":
             if(!canMoveLeft()){
                setupInput();
                return;
            }
            await moveLeft();
            break;
         case "ArrowRight":
         case "d":
             if(!canMoveRight()){
                setupInput();
                return;
            }
            await moveRight();
            break;
        default:
            setupInput();
            return;
    }

    grid.cells.forEach(cell => cell.mergeTiles());

    const newTile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = newTile;

    if(!canMoveUp() && !canMoveLeft() && !canMoveRight() && !canMoveDown()){
        newTile.waitForTransition(true).then(() => {
            alert("you lose");
            console.log("You Lose");
        });
    }

    setupInput();
}

function moveUp(){
    return slideTiles(grid.cellByColumn);
}

function moveLeft(){
    return slideTiles(grid.cellByRow);
}

function moveRight(){
    return slideTiles(grid.cellByRow.map(column => [...column].reverse()));
}

function moveDown(){
    return slideTiles(grid.cellByColumn.map(column => [...column].reverse()));
}

function canMoveUp(){
    return canMove(grid.cellByColumn);
}
function canMoveDown(){
    return canMove(grid.cellByColumn.map(column => [...column].reverse()));
}
function canMoveLeft(){
    return canMove(grid.cellByRow);
}
function canMoveRight(){
    return canMove(grid.cellByRow.map(column => [...column].reverse()));
}

function canMove(cells){
    return cells.some(group => {
        return group.some((cell, index) => {
            if(index === 0) return false
            if(cell.tile == null) return false
            const moveToCell = group[index - 1];
            return moveToCell.canAccept(cell.tile);
        })
    })
}

function slideTiles(cells){
    return Promise.all(
        cells.flatMap(group => {
        const promises = [];
        for(let i = 1; i < group.length; i++){
            const cell = group[i];
            if(cell.tile == null) continue 
            let lastValidCell;
            for(let j = i - 1; j >= 0; j--){
                const moveToCell = group[j];
                if(!moveToCell.canAccept(cell.tile)) break;
                lastValidCell = moveToCell;
            }

            if(lastValidCell != null){
                promises.push(cell.tile.waitForTransition());
                if(lastValidCell.tile != null){
                    lastValidCell.mergeTile = cell.tile;
                }else{
                    lastValidCell.tile = cell.tile;
                }
                
                cell.tile = null;
            }
        }
        return promises;
    }))
    
}

