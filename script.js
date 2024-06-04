let items = document.querySelectorAll(".div-button");
let xPos = [];
let oPos = [];
let winCondition = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];
let currentText = "X";

for (let i = 0; i < 9; i++) {
  items[i].addEventListener("click", () => divClickHandler(items[i], i));
}

function divClickHandler(element, i) {
  if (element.innerText == "") {
    if (currentText == "X") {
      element.innerText = "X";
      xPos.push(i);
      currentText = "O";

      if (xPos.length >= 3) {
        let count = 0;
        winCondition.forEach((element) => {
          element.forEach((elemValue) => {
            xPos.forEach((xValue) => {
              if (xValue == elemValue) {
                count += 1;
              }
            });
          });
          if (count == 3) {
            showWinner("X");
            return;
          } else {
            count = 0;
          }
        });
      }
    } else {
      element.innerText = "O";
      oPos.push(i);
      currentText = "X";

      if (oPos.length >= 3) {
        let count = 0;
        winCondition.forEach((element) => {
          element.forEach((elemValue) => {
            oPos.forEach((oValue) => {
              if (oValue == elemValue) {
                count += 1;
              }
            });
          });
          if (count == 3) {
            showWinner("O");
            return;
          } else {
            count = 0;
          }
        });
      }
    }
  }
  let currentTurnText = document.getElementById("current-turn-text");
  currentTurnText.innerText = currentText;

  if (xPos.length + oPos.length == 9) {
    showWinner("Draw");
    return;
  }
}

function showWinner(winner) {
  
  showPopUp(winner);
  xPos = [];
  oPos = [];
}

let popUpDiv = document.querySelector(".popup-div");
let winnerText = document.getElementById("winner-text");

function showPopUp(winner = "Unknown") {
  if (winner == "Draw") {
    winnerText.innerText = "Match is Draw";
  } else {
    winnerText.innerText = "Winner is " + winner;
  }
  popUpDiv.setAttribute("open", true);
  popUpDiv.removeAttribute("close");
  popUpDiv.style.display = "flex";
}

function hideDiv() {
  for (let i = 0; i < 9; i++) {
    items[i].innerText = "";
  }
  popUpDiv.removeAttribute("open");
  popUpDiv.setAttribute("close", true);
  setTimeout(() => {
    popUpDiv.style.display = "none";
  }, 500);
}
