Game = {
    //Constants

    DROP_X: 9,
    DROP_START: 2,
    DROP_CHAR: "v",
    SPLAT_CHAR: "_",
    GROUND_Y: 8,
    ENEMY_START: 39,
    ENEMY_CHAR: "X",
    TEMPLATE: ["                                         ",
               "                                         ",
               "                                         ",
               "            T                            ",
               "            |                            ",
               "            |                            ",
               "            |                            ",
               "            |                            ",
               "            |                            ",
               "⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀⁀"],
    BIRD: ["    _ ",
           "   ('>",
           " \\==_)"],
    BIRD_FLAP: ["    _ ",
                "   (9>",
                "\\==__)"],
    BIRD_X: 9,
    BIRD_Y: 0,

    //Variables
    score: 0,
    state: 0, //0=start, 1=game, 2=end
    lives: 0,
    keydown: false,
    enemies: Array(5),
    drops: Array(4),
    flapping: false,

    newGame: function(){
        //Setup a new game
        Game.score = 0;
        Game.lives = 5;
        Game.state = 1;
        for (var i = 0 ; i < Game.enemies.length ; i++)
            Game.enemies[i] = -1;
        for (var i = 0 ; i < Game.drops.length ; i++)
            Game.drops[i] = -1;
        Game.flapping = false;
    },

    step: function(){
        //Run this every step
        if (Game.state == 1){
            if (Math.random() < 0.1){
                Game.makeEnemy();
            }
            Game.moveDrops();
            Game.moveEnemies();
            Game.checkCollision();

            //After doing collisions, check player still alive
            if (Game.lives < 1){
                Game.state = 2;
            }
        }
        Game.render();
    },

    makeDrop: function(){
        var idx = -1;
        //If no drops are in the start position and there is a
        //drop available set it's position to the start position
        for (var i = 0 ; i < Game.drops.length ; i++){
            if (Game.drops[i] == Game.DROP_START){
                //Already dropping, dont do it again
                return;
            }
            else if (Game.drops[i] < 0){
                idx = i;
            }
        }
        if (idx >= 0){
            Game.drops[idx] = Game.DROP_START;
            Game.flapping = true;
        }
    },

    moveDrops: function(){
        for (var i = 0 ; i < Game.drops.length ; i++){
            //Purposefully allowing to go 1 past the ground
            if (Game.drops[i] > Game.GROUND_Y){
                //Drop has hit the ground
                Game.drops[i] = -1;
            }
            else if (Game.drops[i] >= 0){
                //Add 1 to drops position
                Game.drops[i]++;
            }
        }
    },

    makeEnemy: function(){
        var idx = -1;
        for (var i = 0 ; i < Game.enemies.length ; i++){
            if (Game.enemies[i] == Game.ENEMY_START){
                //Already making an enemy, dont do it again
                return;
            }
            else if (Game.enemies[i] < 0){
                idx = i;
            }
        }
        if (idx >= 0){
            Game.enemies[idx] = Game.ENEMY_START;
        }

    },

    moveEnemies: function(){
        for (var i = 0 ; i < Game.enemies.length ; i++){
            if (Game.enemies[i] >= 0){
                if (Game.enemies[i] == 0)
                    Game.lives--;
                Game.enemies[i]--;
            }
        }
    },

    checkCollision: function(){
        for (var e = 0 ; e < Game.enemies.length ; e++){
            for (var d = 0 ; d < Game.drops.length ; d++){
                //Some leeway in the collision checking
                if (Game.drops[d] == Game.GROUND_Y &&
                        Math.abs(Game.enemies[e] - Game.DROP_X) <= 1){
                    Game.drops[d] = -1;
                    Game.enemies[e] = -1;
                    Game.score++;
                }
            }
        }
    },

    replace: function(orig, obj, x, y){
        //Put obj into orig at the x,y coords

        //Make a single line reder properly
        if (!(obj instanceof Array))
            obj = [obj];

        if (y < 0 || x < 0 ||
                orig.length == 0 || orig[0].length == 0 ||
                obj.length == 0 || obj[0].length == 0 ||
                y + obj.length >= orig.length ||
                x + obj[0].length >= orig[0].length){
            return;
        }

        for (var i = 0 ; i < obj[0].length ; i++){
            for (var j = 0 ; j < obj.length ; j++){
                orig[j+y][i+x] = obj[j][i];
            }
        }
    },

    render: function() {
        var out = [];

        //Get a character array of the template
        for (var i = 0 ; i < Game.TEMPLATE.length ; i++) {
            out.push(Game.TEMPLATE[i].split(''));
        }

        //Render bird
        if (Game.flapping){
            Game.replace(out, Game.BIRD_FLAP, Game.BIRD_X, Game.BIRD_Y)
            Game.flapping = false;
        }
        else{
            Game.replace(out, Game.BIRD, Game.BIRD_X, Game.BIRD_Y)
        }

        //Start game
        if (Game.state == 0){
            Game.replace(out, ["WELCOME TO CRAPPY BIRD",
                               "",
                               "PRESS [SPACE] TO PLAY"], 18, 3);
        }
        //Game over
        else if (Game.state == 2){
            Game.replace(out, ["       GAME  OVER       ",
                               "   YOUR SCORE WAS " + Game.score,
                               "",
                               "PRESS [SPACE] TO RESTART"], 16, 3);
        }
        //Gameplay
        else if (Game.state == 1){
            //Render score and lives
            Game.replace(out, ["SCORE: " + Game.score,
                               "LIVES: " + Game.lives], 30, 2)

            //Render drops
            for (var i = 0 ; i < Game.drops.length ; i++) {
                var drop_y = Game.drops[i];
                if (drop_y >= 0){
                    if (drop_y == Game.GROUND_Y + 1)
                        out[drop_y - 1][Game.DROP_X] = Game.SPLAT_CHAR;
                    else
                        out[drop_y][Game.DROP_X] = Game.DROP_CHAR;
                }
            }

            //Render enemies
            for (var i = 0 ; i < Game.enemies.length ; i++) {
                var enemy_x = Game.enemies[i];
                if (enemy_x >= 0){
                    out[Game.GROUND_Y][enemy_x] = Game.ENEMY_CHAR;
                }
            }
        }

        //Stitch lines
        for (var i = 0, l = out.length; i < l; i++){
            if (out[i] instanceof Array){
                out[i] = out[i].join("");
            }
        }
        out = out.join("<br/>");

        //Render to DOM
        document.getElementById("game").innerHTML=out;
    },

    //Deal with key events
    key: function(down){
        return function(e){
            //Only care about the space key
            if (e.keyCode != 32) return;

            if (down && !Game.keydown){
                Game.keydown = true;
                if (Game.state == 0 || Game.state == 2){
                    Game.newGame();
                }
                else if (Game.state == 1){
                    Game.makeDrop();
                }
            }
            else if (!down){
                Game.keydown = false;
            }
        }
    }
};

//Set framerate
Game._indervalId = setInterval(Game.step, 100);

//Listen for key events
document.addEventListener('keydown', Game.key(true));
document.addEventListener('keyup', Game.key(false));
