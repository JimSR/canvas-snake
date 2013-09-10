window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 10000 / 60);
    };
})();

//load
function load() {
    this.game = new Game();

    game.initialize();
    game.gameLoop();
}

function Game() {

    var self = this;

    this.canvasWidth = 500;
    this.canvasHeight = 500;
    this.tileWidth = 15;
    this.tileHeight = 15;

    this.tilesX = Math.floor(this.canvasWidth / this.tileWidth);
    this.tilesY = Math.floor(this.canvasHeight / this.tileHeight);

    this.grid = new Array(this.tilesX);
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");


    this.snake;
    this.snakelength = 3;
    this.direction = 1;
    this.lastdirection;

    this.candy = Array();

    this.basefps = 20;
    this.maxfps = 40;
    this.fps = this.basefps;
    this.speedincreasefactor = 0.1;

    this.score = 0;



    this.initialize = function () {

        //canvas
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        //grid
        this.initGrid();
        this.drawGrid();
        this.initSnake();

        //listeners
        this.addListeners();
    };

    this.initGrid = function () {

        for (var i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(this.tilesY);
        }
        this.clearGrid();
        this.generateCandy();
    };

    this.initSnake  = function () {
        this.snake = Array();
        this.snake.push([5, 5]);
    };

    this.clearGrid = function() {
        for (var x = 0; x < this.tilesX ; x++) {
            for (var y = 0; y < this.tilesY ; y++) {
                this.grid[x][y] = 0;
            }
        }
    }

    this.drawGrid = function () {

        for (var y = 0; y < this.tilesY; y++) {
            for (var x = 0; x < this.tilesX ; x++) {
                if (this.grid[x][y] == 0) {
                    this.context.fillStyle = "#AAAAAA";
                } else if (this.grid[x][y] == 1) {
                    this.context.fillStyle = "#22FF22";
                } else if (this.grid[x][y] == 2) {
                    this.context.fillStyle = "#FF0000";
                }
                this.context.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
            }
        }

    };

    this.keyListener = function (e) {
        switch (e.keyCode) {
            //W
            case 87:
                this.changedirection(3);
                break;
            //S
            case 83:
                this.changedirection(2);
                break;
            //A
            case 65:
                this.changedirection(1);
                break;
            //D
            case 68:
                this.changedirection(0);
                break;
        }
    };

    this.changedirection = function (d) {
        this.lastdirection = this.direction;
        this.direction = d % 4;
    }

    var lastDownTarget;
    this.addListeners = function () {
        document.addEventListener('mousedown', function (event) {
            lastDownTarget = event.target;
            
        }, false);

        document.addEventListener('keydown', function (event) {
            if (lastDownTarget == self.canvas) {
                self.keyListener(event);
            }
        }, false);

    };

    this.updateSnake = function () {
   
        var newHead = [this.snake[0][0], this.snake[0][1]];
        //direction
        switch (this.direction) {
            case 0:
                newHead[0] = newHead[0] + 1;
                if (newHead[0] == this.tilesX) newHead[0] = 0;
                break;
            case 1:
                newHead[0] = newHead[0] - 1;
                if (newHead[0] < 0) newHead[0] = this.tilesX - 1;
                break;
            case 2:
                newHead[1] = newHead[1] + 1;
                if (newHead[1] == this.tilesY) newHead[1] = 0;
                break;
            case 3:
                newHead[1] = newHead[1] - 1;
                if (newHead[1] < 0) newHead[1] = this.tilesY - 1;
                break;
        }

        //special case so you cant go backwards

        if (this.snake.length > 1 && this.snake[1][0] == newHead[0] && this.snake[1][1] == newHead[1]) {
            this.direction = this.lastdirection;
            return;
        }

        //check if newHead isn't myself
        switch (this.grid[newHead[0]][newHead[1]]) {
            case 1:
                this.gameover();
                return;
            case 2:
                this.levelup();
                break;
        }

        this.snake.splice(0, 0, newHead);
        if (this.snake.length > this.snakelength) this.snake.pop();

    }

    this.updateGrid = function () {
        this.clearGrid();

        for (var i = 0; i < this.snake.length; i++) {
            this.grid[this.snake[i][0]][this.snake[i][1]] = 1;
        }

        this.grid[this.candy[0]][this.candy[1]] = 2;

    };

    this.calcFPS = function () {

        this.fps = Math.floor(this.basefps + (this.speedincreasefactor * this.snakelength));
        if (this.fps > this.maxfps) this.fps = this.maxfps;
    }

    this.gameover = function () {

        this.snakelength = 3;
        this.calcFPS();
        this.initSnake();
        this.score = 0;
        this.updateScore();
    };

    this.levelup = function () {

        this.snakelength++;

        this.score += 1000;
        this.updateScore();

        this.generateCandy();
        this.calcFPS();
  
    };

    this.generateCandy = function () {

        var x = Math.floor((Math.random()*this.tilesX));
        var y = Math.floor((Math.random()*this.tilesY));
        if (this.grid[x][y] == 0) {
            this.candy = [x, y];
        } else {
            this.generateCandy();
        }
        
    };

    this.updateScore = function () {

        var element = document.getElementById("score");

        element.innerHTML = "" + this.score;
    }

    this.gameLoop = function () {
        console.log(this.fps);
        // update       
        this.updateSnake();
        this.updateGrid();
        // clear
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw stuff
        this.drawGrid();

        // request new frame
        setTimeout(function () {
            requestAnimFrame(function () {
                self.gameLoop();
            });
        }, 1000 / this.fps);

   
    };

};