const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const eaten_pieces_w = document.querySelector("#eaten-pieces-w")
const eaten_pieces_b = document.querySelector("#eaten-pieces-b")
const width=8

let playerGo = 'black' // black starts first
playerDisplay.textContent = 'black'

const eatenPieces_w = []
const eatenPieces_b = []

const startPieces = [
    rookb,knightb,bishopb,queenb,kingb,bishopb,knightb,rookb,
    pawnb,pawnb,pawnb,pawnb,pawnb,pawnb,pawnb,pawnb,
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    '','','','','','','','',
    pawnw,pawnw,pawnw,pawnw,pawnw,pawnw,pawnw,pawnw,
    rookw,knightw,bishopw,queenw,kingw,bishopw,knightw,rookw
]

function createBoard(){

    // loop over chess board eles.
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = startPiece
        square.firstChild && square.firstChild.setAttribute('draggable',true)
        square.setAttribute('square-id', i)
        const row = Math.floor((63-i) / 8)+1

        if(row%2 === 0) {
            square.classList.add(i%2 === 0? "beige" : "brown")
        } else {
            square.classList.add(i%2 === 0? "brown" : "beige")
        }

        if(i < 16) {
            square.firstChild.firstChild.classList.add('black')
        }
        if(i >= 48) {
            square.firstChild.firstChild.classList.add('white')
        }

        gameBoard.append(square)
    } )
}


createBoard()

const allSquares = document.querySelectorAll(".square")

// add event listeners to all squares
allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart)
    square.addEventListener('dragover', dragOver)
    square.addEventListener('drop', dragDrop)
}) 

let startPositionId
let draggedElement


// its gonna give a bunch of data but we only require to retrive target
// we only need parent 
function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id')
    draggedElement = e.target
}


// tells us about the cell over which we are dragging
// we need to prevent default behaviour of the cell
function dragOver(e) {
    e.preventDefault()
}


function dragDrop(e) {
    e.stopPropagation()
    const correctGo = draggedElement.firstChild.classList.contains(playerGo)
    const taken = e.target.classList.contains('piece')
    const valid = checkIfValid(e.target)
    const opponentGo = playerGo === 'white' ? 'black' : 'white'
    const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)  // ? to check if the target has a piece or not
    

    if(correctGo){

        // check this first
        if(takenByOpponent && valid) {
            e.target.parentNode.append(draggedElement)

            if(opponentGo==="white"){
                eatenPieces_w.push(e.target.outerHTML) // Store the SVG HTML of the captured piece
                e.target.remove()
                eaten_pieces_w.innerHTML = eatenPieces_w.join('')
            } else {
                eatenPieces_b.push(e.target.outerHTML) // Store the SVG HTML of the captured piece
                e.target.remove()
                eaten_pieces_b.innerHTML = eatenPieces_b.join('')
            }

            
            checkWin()
            changePlayer()
            return
        }

        // then check this
        if(taken && !takenByOpponent) {
            infoDisplay.textContent = "You can't take your own piece"
            setTimeout(() => infoDisplay.textContent = "", 2000)
            return
        }

        if(valid) {
            e.target.append(draggedElement)
            checkWin()
            changePlayer()
            return
        }
    }
}

function checkIfValid(target) {
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id'))
    const startId = Number(startPositionId)
    const piece = draggedElement.id

    console.log(piece," " ,startId," " ,targetId)

    switch(piece) {

        // pawn
        case 'pawnw': case 'pawnb':
            const starterRoww = [8,9,10,11,12,13,14,15]
            if (
                starterRoww.includes(startId) && startId+width*2 === targetId ||
                startId+width === targetId && !document.querySelector(`[square-id="${startId+width}"]`).firstChild|| 
                startId+width-1 === targetId && document.querySelector(`[square-id="${startId+width-1}"]`).firstChild || 
                startId+width+1 === targetId && document.querySelector(`[square-id="${startId+width+1}"]`).firstChild
            ) {
                return true
            }
            break;

        // knight
        case 'knightw': case 'knightb':
            if(
                startId+width*2-1 === targetId ||
                startId+width*2+1 === targetId ||
                startId+width-2 === targetId ||
                startId+width+2 === targetId ||
                startId-width*2-1 === targetId ||
                startId-width*2+1 === targetId ||
                startId-width-2 === targetId ||
                startId-width+2 === targetId 
            ) {
                return true
            }
            break;  

        // bishop
        case 'bishopw': case 'bishopb':
            for(let i = 1; i < width; i++) {
                if(startId + width*i + i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + width*j + j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                if(startId + width*i - i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + width*j - j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                if(startId - width*i + i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - width*j + j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                if(startId - width*i - i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - width*j - j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
            }
            return false
        
        // rook
        case 'rookw': case 'rookb': 
            for(let i = 1; i < width; i++) {
                // Move down (forward)
                if(startId + width*i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + width*j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                // Move up (backward)
                if(startId - width*i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - width*j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                // Move right
                if(startId + i === targetId && Math.floor(startId/width) === Math.floor(targetId/width)) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                // Move left
                if(startId - i === targetId && Math.floor(startId/width) === Math.floor(targetId/width)) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
            }
            return false
        
        // king
        case 'kingw': case 'kingb':
            if(
                startId+width === targetId ||
                startId-1 === targetId ||
                startId+1 === targetId ||
                startId-width === targetId ||
                startId+width-1 === targetId ||
                startId+width+1 === targetId ||
                startId-width-1 === targetId ||
                startId-width+1 === targetId
            ) {
                return true
            }
            break;

        // queen
        case 'queenw': case 'queenb':
            for(let i = 1; i < width; i++) {
                // Move down (forward)
                if(startId + width*i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + width*j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                // Move up (backward)
                if(startId - width*i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - width*j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                // Move right
                if(startId + i === targetId && Math.floor(startId/width) === Math.floor(targetId/width)) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                // Move left
                if(startId - i === targetId && Math.floor(startId/width) === Math.floor(targetId/width)) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }

                 if(startId + width*i + i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + width*j + j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                if(startId + width*i - i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId + width*j - j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                if(startId - width*i + i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - width*j + j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
                if(startId - width*i - i === targetId ) {
                    for(let j = 1; j < i; j++) {
                        if(document.querySelector(`[square-id="${startId - width*j - j}"]`).firstChild) {
                            return false
                        }
                    }
                    return true
                }
            }
            return false
    }
}

function changePlayer() {
    if(playerGo==='black') {
        reverseIds()
        playerGo = 'white'
        playerDisplay.textContent = 'white'
    } else {
        revertIds()
        playerGo = 'black'
        playerDisplay.textContent = 'black' 
    }
}


// function to reverse the ids of the squares 0-63 to 63-0
function reverseIds(){
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square,i) => 
        square.setAttribute('square-id', (width*width-1)-i))
}

function revertIds(){
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square,i) => 
        square.setAttribute('square-id', i))
}

function checkWin() {
   const kingw = document.querySelector("#kingw")
   const kingb = document.querySelector("#kingb")
    if(!kingw) {
         alert("Black wins!")
         resetGame()
    } else if(!kingb) {
         alert("White wins!")
         resetGame()
    }
}

function resetGame() {
    location.reload()
}


