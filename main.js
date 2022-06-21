const game = document.getElementById("game");
const fieldcounter = document.getElementById("fieldcount");
const flagcounter = document.getElementById("flagcount");
const timecounter = document.getElementById("timecount");
const reset = document.getElementById("reset");

const green = "#13d213";
const lightGreen = "#50dd50"
const gray = "#c7a68f";
const lightGray = "#ddc9bb";

const size = 30 // Math.floor((window.innerHeight * 0.8)/20);
const bombs = new Array(20).fill(0).map(x => Array(20).fill(0));
const numbers = [];

let started = false;
let fields = 400;
let flags = 60;
let time = 0;
let timer;

init();

function Cell(alink)
{
    this.isBomb = false;
    this.bombsAround = 0;
    this.isFlag = false;
    this.isClicked = false;
    this.link = alink;
    this.row = Math.floor(alink.id / 20);
    this.column = alink.id % 20;
}

function init() 
{
    for (let i=0; i<20; i++)
    {
        let tr = document.createElement("tr");
        tr.id = "tr"+i;
        tr.width = size*20;
        tr.height = size;
        for (let j=0; j<20; j++)
        {
            let td = document.createElement("td");
            td.id = i*20+j;
            td.width = size;
            td.height = size;
            td.className = "active";
            td.innerHTML = "";
            td.addEventListener("click", (e) => {
                let row = Math.floor(e.target.id / 20);
                let column = e.target.id % 20;
                let target = bombs[row][column];
                if (!started) generate(e.target);
                handleClick(target);
            });
            td.addEventListener("contextmenu", (e) => {
                let row = Math.floor(e.target.id / 20);
                let column = e.target.id % 20;
                let target = bombs[row][column];
                e.preventDefault();
                if ((!target.isFlag) && (!target.isClicked))
                {
                    e.target.innerHTML = "&#128681";
                    target.isFlag = true;
                    target.isClicked = true;
                    flags--;
                }
                else if (target.isFlag)
                {
                    e.target.innerHTML = "";
                    target.isFlag = false;
                    target.isClicked = false;
                    flags++;
                }
                flagcounter.innerHTML = flags + "&#128681"
            });
            if ((i+j) % 2 == 0)
            {
                td.style.backgroundColor = lightGreen;
            }
            else td.style.backgroundColor = green;
            bombs[i][j] = new Cell(td);
            tr.appendChild(td);
        }
        game.appendChild(tr);
    }
}

function generate(target) 
{
    for (let i=0; i<60; i++)
    {
        uniqueNumber(400, target.id);
    }
    numbers.forEach((el) => {
        let row = Math.floor(el / 20);
        let column = el % 20;
        bombs[row][column].isBomb = true;
    });
    started = true;
    timer = setInterval(countTime, 100);
}

function handleClick(target)
{
    if (!target.isClicked)
    {
        clickValidation(target);
    }
    else if (target.isClicked)
    {
        let neighbours = getNeighbours(target);
        let bombsAround = getSurroundingBombsNumber(target);
        let flagsAround = 0;
        neighbours.forEach((el) => {
            if (el.isFlag)
            {
                flagsAround++;
            }
        });
        if ((flagsAround == bombsAround) && (!target.isFlag))
        {
            neighbours.forEach((el) => {
                if ((!el.isClicked) && (!el.isFlag))
                {
                    clickValidation(el);
                }
            });
        }
    }
    if (fields == 60) // win
    {
        bombs.forEach((el) => {
            el.forEach((el2) => {
                el2.link.outerHTML = el2.link.outerHTML;
            });
        });
        alert("Wygrales, czas: " + time/10);
        clearInterval(timer);
        reset.style.display = "block";
        reset.addEventListener("click", (e) => {
            location.reload();
        });
    }
}

function getNeighbours(target) 
{
    let row = target.row;
    let column = target.column;
    let neighbours = [];
    if (((row != 0) && (row != 19)) && ((column != 0) && (column != 19)))
    {
        neighbours = [
            bombs[row-1][column-1],
            bombs[row-1][column],
            bombs[row-1][column+1],
            bombs[row][column-1],
            bombs[row][column+1],
            bombs[row+1][column-1],
            bombs[row+1][column],
            bombs[row+1][column+1],
        ];
    }
    else if ((row == 0) && (column == 0))
    {
        neighbours = [
            bombs[row][column+1],
            bombs[row+1][column],
            bombs[row+1][column+1]
        ];
    }
    else if ((row == 19) && (column == 19))
    {
        neighbours = [
            bombs[row][column-1],
            bombs[row-1][column],
            bombs[row-1][column-1]
        ];
    }
    else if ((row == 0) && (column == 19))
    {
        neighbours = [
            bombs[row][column-1],
            bombs[row+1][column],
            bombs[row+1][column-1]
        ];
    }
    else if ((row == 19) && (column == 0))
    {
        neighbours = [
            bombs[row][column+1],
            bombs[row-1][column],
            bombs[row-1][column+1]
        ];
    }
    else if (row == 0)
    {
        neighbours = [
            bombs[row][column-1],
            bombs[row][column+1],
            bombs[row+1][column-1],
            bombs[row+1][column],
            bombs[row+1][column+1]
        ];
    }
    else if (row == 19)
    {
        neighbours = [
            bombs[row][column-1],
            bombs[row][column+1],
            bombs[row-1][column-1],
            bombs[row-1][column],
            bombs[row-1][column+1]
        ];
    }
    else if (column == 0)
    {
        neighbours = [
            bombs[row-1][column],
            bombs[row-1][column+1],
            bombs[row][column+1],
            bombs[row+1][column],
            bombs[row+1][column+1]
        ];
    }
    else if (column == 19)
    {
        neighbours = [
            bombs[row-1][column],
            bombs[row-1][column-1],
            bombs[row][column-1],
            bombs[row+1][column],
            bombs[row+1][column-1]
        ];
    }
    return neighbours;
}

function getSurroundingBombsNumber(target)
{
    let neighbours = getNeighbours(target);
    let counter = 0;
    neighbours.forEach((el) => {
        if (el.isBomb) counter++;
    });
    return counter;
}

function reveal(target)
{
    let bombsAround = getSurroundingBombsNumber(target);
    let neighbours = getNeighbours(target);
    switch(bombsAround) // kolory
    {
        case 1:
            target.link.style.color = "blue";
            break;
        case 2:
            target.link.style.color = "green";
            break;
        case 3:
            target.link.style.color = "red";
            break;
        case 4:
            target.link.style.color = "purple";
            break;
        case 5:
            target.link.style.color = "orange";
            break;
        case 6:
            target.link.style.color = "pink";
            break;
        case 7:
            target.link.style.color = "gray";
            break;
        case 8:
            target.link.style.color = "black";
            break;
        default:
            target.link.style.color = "transparent"; 
            break;
    }
    target.link.innerHTML = bombsAround;
    fields--;
    fieldcounter.innerHTML = fields;
    target.isClicked = true;

    if ((target.row+target.column) % 2 == 0)
    {
        target.link.style.backgroundColor = lightGray;
    }
    else target.link.style.backgroundColor = gray;

    if (bombsAround == 0)
    {
        neighbours.forEach((el) => {
            if (!el.isClicked)
            {
                if (el.bombsAround == 0)
                {
                    reveal(el);
                }
            }
        });
    }
}

function clickValidation(target)
{
    if (!target.isBomb)
    {
        reveal(target);
    }
    else
    {
        bombs.forEach((el) => {
            el.forEach((el2) => {
                if (el2.isBomb) el2.link.style.backgroundColor = "red";
                el2.link.outerHTML = el2.link.outerHTML;
            });
        });
        clearInterval(timer);
        reset.style.display = "block";
        reset.addEventListener("click", (e) => {
            location.reload();
        });
    }
}

function countTime()
{
    time++;
    timecounter.innerHTML = Math.floor(time/10);
}

const uniqueNumber = (maxVal, excluded) => {
    const number = Math.floor(Math.random() * maxVal);
    const cell = bombs[Math.floor(excluded/20)][excluded%20];
    let neighbours = getNeighbours(cell).map(x => parseInt(x.link.id));
    if ((!numbers.includes(number)) && (number != excluded) && (!neighbours.includes(number))) {
       numbers.push(number);
       return number;
    } else if (numbers.length - 1 !== maxVal) {
       uniqueNumber(maxVal, excluded);
    }
}

