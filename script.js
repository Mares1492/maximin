const boardSizeInput = document.getElementById("board-size");
const startButton = document.getElementById("start-button");
const statusDisplay = document.getElementById("status");
const gameContainer = document.getElementById("game-container");
const gameGrid = document.getElementById("game-grid"); // Reference to the game grid table
const p1Score = document.getElementById("p1Score")
const p2Score = document.getElementById("p2Score")

const ALLOWED_CELLS = ['F','0','+']

let boardSize = 9; // Default board size
let currentPlayer = 1; // Player 1 starts
let player1 = {
    position: 0,
    points:0
}
let player2 = {
    position: 0,
    points :0
}
let targetCell = 0; // Initialize target cell
let gameBoard = []; // Declare the gameBoard variable
let isEnd = false;
let globalPathArray = []
let turn = 0;


function handleBonus(bIndex){
    let el = gameBoard[bIndex]
    el.color = "black";
    if(currentPlayer===1){
        player1.points++
        p1Score.textContent = player1.points
    }
    else{
        player2.points++
        p2Score.textContent = player2.points
    }
}

function scanEffect(index,timeout,color = "yellow",withColor = true){
    let bgColor = gameBoard[index].style.backgroundColor;
    gameBoard[index].style.color = "black";
    if(withColor){
        gameBoard[index].style.boxShadow = "0 0 40px rgba(255, 255, 0, 0.7)";
        gameBoard[index].style.backgroundColor = color; // Change the background color
        if (gameBoard[index].textContent === '+'){
            gameBoard[index].style.color = "gold";
        }
    }
    else
    {
        if(currentPlayer === 1){
            gameBoard[index].style.boxShadow = "0 0 10px rgba(0, 0, 255, 0.2)";
        }
        else
        {
            gameBoard[index].style.boxShadow = "0 0 10px rgba(255, 0, 0, 0.2)";
        }
    }
    setTimeout(() => {
        gameBoard[index].style.boxShadow = "0 0 0 rgba(255, 255, 0, 0.7)";
        if(withColor){
            gameBoard[index].style.backgroundColor = bgColor; // Restore the original color
        }
    }, timeout);
}

function buildPath(pathArray) {
    if(isEnd){
        return
    }
    ///console.log(pathArray.at(-1)+"|"+targetCell)
    if (pathArray.at(-1) === targetCell){
        return {
            path:pathArray,
            hasFinished:true
        }
    }
    if (pathArray.length > boardSize){
        return {
            path:pathArray,
            hasFinished:false
        }
    }
    let possibleSteps = [pathArray.at(-1)-1,pathArray.at(-1)+1,pathArray.at(-1)-9,pathArray.at(-1)+9]
    possibleSteps = possibleSteps.filter(element => !pathArray.includes(element));
    if (pathArray.length === 1){
        if(possibleSteps.every(
            index => 
                (
                    index < 0 || 
                    index >= gameBoard.length || 
                    (  
                        !ALLOWED_CELLS.includes( gameBoard[index].textContent)
                    )
                ))){      
            statusDisplay.textContent = `Player ${currentPlayer === 1 ? 2 : 1} has won`;
            alert(`Player ${currentPlayer === 1 ? 2 : 1} has won, Player ${currentPlayer} cannot make a move`)
            handleGameOver()
            return
        }
    }
    let pathMarks = []
    for (const index of possibleSteps) {
        if (index > 0 && index < gameBoard.length - 1){
            scanEffect(index,150*pathArray.length,"transparent",false)  
            if(ALLOWED_CELLS.includes(gameBoard[index].textContent)){
                let arrayToSend = pathArray.slice()
                arrayToSend.push(index)
                let newPathMark = buildPath(arrayToSend)
                if (newPathMark.hasFinished){
                    pathMarks.push(newPathMark)
                }
            }
        }
    }
    if(!pathMarks.length){
        if (pathArray.length > 1){
            return {
                path:pathArray,
                hasFinished:false
            }
        }
        if(pathArray.length === 1){
            console.log("Path not found")
            globalPathArray = [];
            return
        }
    }
    //min var for performance
    let minPathIndex = 0
    for (let index = 0; index < pathMarks.length; index++) {
        if (pathMarks[index].path.length < pathMarks[minPathIndex].path.length){
            minPathIndex = index
        }
    }
    if(pathArray.length === 1){
        globalPathArray = pathMarks[minPathIndex].path
        console.log("Path: "+ globalPathArray)
        return
    }
    return {
        path:pathMarks[minPathIndex].path,
        hasFinished : true
    }
}

function createGameGrid(){
    gameGrid.innerHTML = ""; // Clear the previous grid
    for (let i = 0; i < 9 * boardSize; i++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
         // Adjust the content as needed
        // Add a click event listener to each cell
        cell.addEventListener("click", () => handleClick(i));
        cell.textContent = 0;
        gameGrid.appendChild(cell);
        gameBoard.push(cell);
    }
}

function updateGameBoardDisplay() {
    for (let x = 0; x < gameBoard.length; x++) {
            const cell = gameBoard[x];
            const cellValue = cell.textContent;
            // Set the background color based on the cell value
            let cellColor = "transparent"; // Default color for empty cells
            switch (cellValue) {
                case '1':
                    cellColor = "#007bff";
                    break;
                case '2':
                    cellColor = "#ff0000";
                    break;
                case 'F':
                    cellColor = "#00ff08";
                    break;
            }

            cell.style.backgroundColor = cellColor;
    }
}

function handleGameOver(){
    isEnd = true;
    updateGameBoardDisplay();
}

function updateGame() {
    turn++
    // Check if the current player has reached the target
    if (player1.position === targetCell || player2.position === targetCell) {
        console.log("Is p1 winner: "+player1.position === targetCell)
        console.log("Is p2 winner: "+player2.position === targetCell)
        // Player has reached the target
        let winner = currentPlayer;
        if (player1.points>player2.points) {
            winner = 1
        }
        if (player1.points<player2.points) {
            winner = 2
        }
        statusDisplay.textContent = `Player ${winner} wins this round!`;
        alert(`Player ${winner} wins!`);
        handleGameOver();
        // Update the game board to make two cells unreachable
    } else {
        // Player hasn't reached the target, continue the round
        handleCellsChange();
        updateGameBoardDisplay();
        // Switch the current player foar the next round
        currentPlayer = currentPlayer === 1 ? 2 : 1
        statusDisplay.textContent = `Player ${currentPlayer} turns`;
        if (currentPlayer === 1)
        {
            buildPath([player1.position])
        }
        else
        {
            buildPath([player2.position])
        }
        if(turn>1){
            for (let index = 1; index < globalPathArray.length-1; index++) {
                if (currentPlayer === 1)
                {   
                    gameBoard[globalPathArray[index]].style.backgroundColor = "#5d8fc4";
                }
                else 
                {
                    gameBoard[globalPathArray[index]].style.backgroundColor = "#f57979";
                }
                scanEffect(globalPathArray[index],200*index);
            }
        }
    }
}

function handleCellsChange() {
    let freeCells = [];
    let closedCells = [];
    let numberOfCellsToClose =turn<8 ? 8-turn : 2
    for (let index = 0; index < gameBoard.length; index++) {
        switch (gameBoard[index].textContent) {
            case '0':
                freeCells.push(index);
                break;
            case '-':
                closedCells.push(index);
                break;
        }
    }
    console.log(freeCells.length)
    if(freeCells.length < numberOfCellsToClose){
        return
    }
    if (closedCells.length){
        for (let cellIndex = 0; cellIndex < closedCells.length; cellIndex++) {
            if (Math.round(Math.random()*10)+1 === 1){
                gameBoard[closedCells[cellIndex]].textContent = '+';
            }
        }
    }
    console.log("next")
    for (let index = 0; index < numberOfCellsToClose; index++) {
        let cellIndex  = freeCells[Math.floor(Math.random()*(freeCells.length-1))];
        gameBoard[cellIndex].textContent = '-';
    }
}

function resetPositions() {
    // Reset player positions to the starting positions
    targetCell = Math.floor(gameBoard.length/2)
    gameBoard[targetCell].textContent = 'F';
    player1.position =  0;
    gameBoard[player1.position].textContent = 1;
    player2.position = gameBoard.length-1;
    gameBoard[player2.position].textContent = 2;

}

function handleClick(cellIndex){
    if(isEnd){
        alert("The game has ended");
        return
    }
    let playerPositon = currentPlayer === 1 ? player1.position : player2.position;
    if (
        playerPositon + 9 === cellIndex ||
        playerPositon - 9 === cellIndex ||
        playerPositon + 1 === cellIndex ||
        playerPositon - 1 === cellIndex
        )
        {
            let value = gameBoard[cellIndex].textContent;
            if (ALLOWED_CELLS.includes(value)){
                if(value === '+'){
                    handleBonus(cellIndex)
                }
                gameBoard[cellIndex].textContent = currentPlayer;
                if(currentPlayer === 1){
                    gameBoard[player1.position].textContent= 0
                    player1.position = cellIndex
                    gameBoard[player1.position].textContent = 1
                }
                else{
                    gameBoard[player2.position].textContent = 0
                    player2.position = cellIndex
                    gameBoard[player2.position].textContent = 2
                }
                updateGame();
                
            }
        }
}

function startGame() {
    currentPlayer = 1;
    // Get the user-selected board size
    /*const newSize = parseInt(boardSizeInput.value);

    // Check if the input is a valid number and within a reasonable range
    if (isNaN(newSize) || newSize < 3 || newSize % 2 !== 1) {
        alert("Please enter a valid board size minimum 3 and having a center cell.");
        return;
    }

    // Set the board size to the user's choice
    boardSize = newSize;*/
    // Update the status display
    statusDisplay.textContent = `Player ${currentPlayer} turns`;
    createGameGrid()
    resetPositions()
    updateGameBoardDisplay()
    // Disable the board size input and start button
    /*boardSizeInput.disabled = true;
    startButton.disabled = true;*/
    isEnd = false;
    startButton.hidden = true;
    startButton.textContent = "Restart";
}

startButton.addEventListener("click", startGame);