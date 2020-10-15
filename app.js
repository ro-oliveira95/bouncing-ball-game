const canvas = document.querySelector("#myCanvas");
const popupWindow = document.querySelector(".popup-window");
const playagainBtn = document.querySelector(".btn-playagain");

playagainBtn.addEventListener("click", restartGame);

window.addEventListener("load", initGame);

function initGame() {
  myGameArea.start();
  myGamePiece = new hero(30, 50, 35, 1);
  scoreBoard = new scoreboard(100, 40, myGameArea.width / 2 + 50, 30);
  levelBoard = new levelboard(100, 40, myGameArea.width / 2 - 70, 30);
  obstacles = [
    new obstacle(myGameArea.width - 100, myGameArea.height / 2, 0, 600, 1),
    new obstacle(
      myGameArea.width - 100,
      myGameArea.height / 4,
      myGameArea.width + 300,
      myGameArea.height / 4,
      1
    ),
    new obstacle(
      myGameArea.width - 100,
      myGameArea.height / 4,
      myGameArea.width + 700,
      myGameArea.height - 100,
      1
    ),
  ];
}

var myGameArea = {
  canvas: document.querySelector("canvas"),
  start: function () {
    this.score = 0;
    this.level = 1;
    this.gravityEnabled = true;
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.interval = setInterval(updateGameArea, 10);
    window.addEventListener("keydown", function (e) {
      myGameArea.keys = myGameArea.keys || [];
      myGameArea.keys[e.keyCode] = e.type == "keydown";
    });
    window.addEventListener("keyup", function (e) {
      myGameArea.keys[e.keyCode] = e.type == "keydown";
    });
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    this.gravityEnabled = false;
    clearInterval(this.interval);
  },
};

function hero(radius, x, y, speed) {
  this.gamearea = myGameArea;
  this.radius = radius;
  this.speedX = 0;
  this.speedY = 0;
  this.speed = speed;
  this.x = x;
  this.y = y;
  this.lineThickness = 5;
  this.update = function () {
    ctx = myGameArea.context;

    var gradient = ctx.createLinearGradient(0, 0, this.gamearea.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.25", "green");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("0.75", "purple");
    gradient.addColorStop("1.0", "red");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.lineThickness;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
}

function obstacle(width, height, x, y, speed) {
  this.gamearea = myGameArea;
  this.width = width;
  this.height = height;
  this.speedX = -4;
  this.speedY = 0;
  this.speed = speed;
  this.x = x;
  this.y = y;

  this.update = function (color) {
    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
}

function scoreboard(width, height, x, y) {
  this.gamearea = myGameArea;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = this.gamearea.context;
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText(this.gamearea.score.toString(), this.x, this.y);
  };
}

function levelboard(width, height, x, y) {
  this.gamearea = myGameArea;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.update = function () {
    // Rendering level text
    ctx = this.gamearea.context;
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText(`Level ${this.gamearea.level.toString()}`, this.x, this.y);

    // Rendering the vertical separator
    ctx.beginPath();
    ctx.moveTo(this.x + this.width + 5, 5);
    ctx.lineTo(this.x + this.width + 5, 5 + this.height - 10);
    ctx.strokeStyle = "red";
    ctx.stroke();
  };
}

function updateGameArea() {
  myGameArea.clear();
  const speed = myGamePiece.speed;

  // Applying gravity
  if (myGameArea.gravityEnabled) {
    if (!isCollision("bottom", myGamePiece.x, myGamePiece.y + speed / 4)) {
      myGamePiece.speedY += speed / 4;
    } else {
      myGamePiece.speedY = 0;
    }
  }

  // evaluating inertia-driven events
  if (myGamePiece.speedX !== 0) {
    // if no colision happens, applies 'drag force'
    myGamePiece.speedX > 0
      ? (myGamePiece.speedX -= speed / 4)
      : (myGamePiece.speedX += speed / 4); // /8
  }

  // checking for the user inputs
  if (myGameArea.keys && myGameArea.keys[37]) {
    if (!isCollision("left", myGamePiece.x - speed / 2, myGamePiece.y))
      myGamePiece.speedX -= speed / 2;
    else myGamePiece.speedX = 0;
  }
  if (myGameArea.keys && myGameArea.keys[39]) {
    if (!isCollision("right", myGamePiece.x + speed / 2, myGamePiece.y))
      myGamePiece.speedX += speed / 2;
    else myGamePiece.speedX = 0;
  }
  if (myGameArea.keys && myGameArea.keys[38]) {
    if (!isCollision("top", myGamePiece.x, myGamePiece.y - 10 * speed)) {
      myGamePiece.speedY = -5 * speed;
      console.log("case1");
    } else {
      myGamePiece.speedY = 0;
    }
  }
  if (myGameArea.keys && myGameArea.keys[40]) {
    if (!isCollision("bottom", myGamePiece.x, myGamePiece.y + speed / 2))
      myGamePiece.speedY += speed / 2;
    else myGamePiece.speedY = 0;
  }

  // treating collisions with inertia
  if (isCollision("left", myGamePiece.x + myGamePiece.speedX, myGamePiece.y)) {
    if (Math.abs(myGamePiece.speedX) >= speed) {
      myGamePiece.speedX = -myGamePiece.speedX - 2 * speed;
    } else {
      myGamePiece.speedX = 0;
    }
  }
  if (isCollision("right", myGamePiece.x + myGamePiece.speedX, myGamePiece.y)) {
    if (Math.abs(myGamePiece.speedX) >= speed) {
      myGamePiece.speedX = -myGamePiece.speedX + obstacles[0].speedX;
    } else {
      myGamePiece.speedX = 2 * obstacles[0].speedX;
    }
  }
  if (isCollision("top", myGamePiece.x, myGamePiece.y + myGamePiece.speedY)) {
    if (Math.abs(myGamePiece.speedY) >= speed) {
      myGamePiece.speedY = -myGamePiece.speedY - 2 * speed;
    } else {
      myGamePiece.speedY = 0;
    }
  }
  if (
    isCollision("bottom", myGamePiece.x, myGamePiece.y + myGamePiece.speedY)
  ) {
    if (Math.abs(myGamePiece.speedY) >= speed) {
      myGamePiece.speedY = -myGamePiece.speedY + 4 * speed;
    } else {
      myGamePiece.speedY = 0;
    }
  }

  obstacles.forEach((obstacle, index) => {
    // normal x position refreshing
    obstacle.newPos();
    // checking if it is out of the scene, then shifts to the start with new y pos and height
    if (obstacle.x + obstacle.width < 0) {
      realocateObstacle(index, obstacles);
    }
    let obstacleColor;
    switch (myGameArea.level) {
      case 1:
        obstacleColor = "rgb(14, 100, 67)";
        break;
      case 2:
        obstacleColor = "rgb(80, 74, 21)";
        break;
      case 3:
        obstacleColor = "rgb(29, 104, 98)";
        break;
      case 4:
        obstacleColor = "rgb(211, 70, 70)";
        break;
      default:
        obstacleColor = "rgb(221, 140, 86) ";
    }
    obstacle.update(obstacleColor);
  });

  // adding points to the score
  myGameArea.score += Math.abs(obstacles[0].speedX);

  // update level
  checkLevel(myGameArea.score);

  myGamePiece.newPos();
  myGamePiece.update();

  scoreBoard.update();
  levelBoard.update();
}

function checkLevel(points) {
  // level 2
  if (points >= 5000 && points <= 10000) {
    myGameArea.level = 2;
    obstacles.forEach((obstacle) => {
      obstacle.speedX = -6;
    });
  } else if (points > 10000 && points <= 20000) {
    myGameArea.level = 3;
    canvas.style.borderBottom = "5px solid red";
  } else if (points > 20000) {
    myGameArea.level = 4;
    canvas.style.borderTop = "5px solid red";
  }
}

function randomVal(min, max) {
  return min + Math.floor((max - min) * Math.random());
}

function realocateObstacle(currObstIndex, obstacleList) {
  let shiftYtop, shiftYbottom, obstDistX;
  const gap = 2 * myGamePiece.radius + 2 * myGamePiece.lineThickness + 10;
  const currentObstacle = obstacleList[currObstIndex];

  currentObstacle.x = myGameArea.width + randomVal(0, 200);

  obstacleList.forEach((obstacle, index) => {
    if (index !== currObstIndex) {
      obstDistX = obstacle.x + obstacle.width - currentObstacle.x;
      if (obstDistX >= 0 && obstDistX <= gap) {
        shiftYtop = gap;
      } else {
        shiftYtop = 0;
      }
    }
  });

  currentObstacle.y = randomVal(shiftYtop, myGameArea.height);
  shiftYtop != 0 ? (shiftYbottom = 0) : (shiftYbottom = gap);
  currentObstacle.height = randomVal(
    100,
    myGameArea.height - currentObstacle.y - shiftYbottom
  );
  currentObstacle.width = randomVal(100, myGameArea.width - 100);
}

function isObstacleColission(pieceLimits, obstacleLimitsList, border) {
  let isCollision = false;
  switch (border) {
    case "left":
      obstacleLimitsList.forEach((obstacleLimits) => {
        if (
          pieceLimits["x-"] <= obstacleLimits["x+"] &&
          pieceLimits["x+"] >= obstacleLimits["x+"] &&
          myGamePiece.y >= obstacleLimits["y-"] - myGamePiece.radius &&
          myGamePiece.y <= obstacleLimits["y+"] + myGamePiece.radius
        ) {
          isCollision = true;
        }
      });
      break;
    case "right":
      obstacleLimitsList.forEach((obstacleLimits) => {
        if (
          pieceLimits["x+"] >= obstacleLimits["x-"] &&
          pieceLimits["x-"] <= obstacleLimits["x-"] &&
          myGamePiece.y >= obstacleLimits["y-"] - myGamePiece.radius &&
          myGamePiece.y <= obstacleLimits["y+"] + myGamePiece.radius
        )
          isCollision = true;
      });
      break;
    case "top":
      obstacleLimitsList.forEach((obstacleLimits) => {
        if (
          pieceLimits["y-"] <= obstacleLimits["y+"] &&
          pieceLimits["y+"] >= obstacleLimits["y+"] &&
          myGamePiece.x >= obstacleLimits["x-"] - myGamePiece.radius &&
          myGamePiece.x <= obstacleLimits["x+"] + myGamePiece.radius
        )
          isCollision = true;
      });
      break;
    case "bottom":
      obstacleLimitsList.forEach((obstacleLimits) => {
        if (
          pieceLimits["y+"] >= obstacleLimits["y-"] &&
          pieceLimits["y-"] <= obstacleLimits["y-"] &&
          myGamePiece.x >= obstacleLimits["x-"] - myGamePiece.radius &&
          myGamePiece.x <= obstacleLimits["x+"] + myGamePiece.radius
        )
          isCollision = true;
      });
      break;
  }
  return isCollision;
}

function isCollision(border, xpos, ypos) {
  const pieceLimits = {
    "x+": xpos + myGamePiece.radius + myGamePiece.lineThickness,
    "x-": xpos - myGamePiece.radius - myGamePiece.lineThickness,
    "y+": ypos + myGamePiece.radius + myGamePiece.lineThickness,
    "y-": ypos - myGamePiece.radius - myGamePiece.lineThickness,
  };

  const obstacleLimits = [];
  obstacles.forEach((obstacle) => {
    obstacleLimits.push({
      "x+": obstacle.x + obstacle.width,
      "x-": obstacle.x,
      "y+": obstacle.y + obstacle.height,
      "y-": obstacle.y,
    });
  });

  if (border === "left") {
    // GAMEOVER
    if (pieceLimits["x-"] <= 0) {
      gameOver();
      return true;
    }
    if (isObstacleColission(pieceLimits, obstacleLimits, "left")) {
      return true;
    }
  }

  if (border === "right") {
    if (
      pieceLimits["x+"] >= myGameArea.width ||
      isObstacleColission(pieceLimits, obstacleLimits, "right")
    ) {
      return true;
    }
  }

  if (border === "top") {
    if (pieceLimits["y-"] <= 0) {
      if (myGameArea.level >= 4) {
        gameOver();
      }
      return true;
    }

    if (isObstacleColission(pieceLimits, obstacleLimits, "top")) {
      return true;
    }
  }

  if (border === "bottom") {
    if (pieceLimits["y+"] >= myGameArea.height) {
      if (myGameArea.level >= 3) {
        gameOver();
      }
      return true;
    }
    if (isObstacleColission(pieceLimits, obstacleLimits, "bottom")) {
      return true;
    }
  }

  // else
  return false;
}

function gameOver() {
  obstacles.forEach((obstacle) => {
    obstacle.speedX = 0;
  });
  myGamePiece.speedX = 0;
  myGamePiece.speedY = 0;
  myGameArea.stop();
  popWindow();
}

function popWindow() {
  popupWindow.style.display = "flex";
}

function restartGame() {
  popupWindow.style.display = "none";
  canvas.style.borderBottom = "5px solid green";
  canvas.style.borderTop = "5px solid green";
  initGame();
}
