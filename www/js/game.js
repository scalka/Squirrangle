var game; // contains game
var map;
var foreground, background;

window.onload = function () {
    console.log("==onload event");
    //populates game 3rd argument handles resizing auto-streched
    game = new Phaser.Game(640, 960, Phaser.AUTO, "");
    //adding states to the phaser game
    game.state.add("Boot", boot);
    game.state.add("Preload", preload);
    //game.state.add("TitleScreen", titleScreen);
    //game.state.add("PlayGame", playGame);
    //game.state.add("GameOverScreen", gameOverScreen);
    //kickstart the game with Boot state
    game.state.start("Boot");
};
// the boot state is an object with a prototype method and it accepts the game object as an argument
var boot = function(game){};
    boot.prototype = { // methods are run automatically by phaser -preload, create etc
        //preload function runs before the create function
        preload: function () {
            console.log("==boot state. Preload method");
            //preloading an asset that will be a preloading bar
            //this.game.load.image("loading", "assets/sprites/loading.png"); 
        },
        //create function sets up how the gamescreen is positioned
        create: function () {
            console.log("==boot state. Create method");
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            // keep original aspect ratio while maximising size in browser
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            //triggering the next state
            this.game.state.start("Preload");
        }
    };
//Preload state: loads assets, dipsays a loadingbar. 
var preload = function(game){};
    preload.prototype = {
        preload: function() {
            // Here we load the assets required for our preloader (in this case a 
            // background and a loading bar)
            game.load.tilemap('map', '../asset/tilemaps/tiles_background.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', '../asset/tiles/tiles_background.png');
            console.log("==preload state. Preload method");
        },
        create: function(){
            game.stage.backgroundColor = '#1122cc';

            map = game.add.tilemap('map', 640, 900);
            map.addTilesetImage('background_image', 'tiles');

            background = map.createLayer('background_layer');
            background.resizeWorld();
            background.scale(1.5);
            background.warp = false;

        }
    };

