var map;
var foreground, background;
var p;
var cursors;

(function () {
    /* globals Phaser:false, BasicGame: false */
    //  Create your Phaser game and inject it into the game div.
    //  We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
    //  We're using a game size of 480 x 640 here, but you can use whatever you feel makes sense for your game of course.
    var game = new Phaser.Game(480, 640, Phaser.AUTO, 'game');

    //  Add the States your game has.
    //  You don't have to do this in the html, it could be done in your Game state too, but for simplicity I'll keep it here.
    game.state.add('Game', BasicGame.Game);

    //  Now start the Game state.
    game.state.start('Game');

})();

var preload = function(game){};
    preload.prototype = {
        preload: function() {
            // Here we load the assets required for our preloader (in this case a 
            // background and a loading bar)
            game.load.tilemap('tiles_background', 'asset/tilemaps/background_tiles.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles_image', 'assets/tilemaps/tiles/tiles_background.png');
            console.log("==preload state. Preload method");
        },
        create: function(){
            game.stage.backgroundColor = '#ffffff';

            map = game.add.tilemap('tiles_background');
            console.log(map)
            map.addTilesetImage('tiles_image', 'tiles');
            
            
            background = map.createLayer('Background');
            background.resizeWorld();
            background.warp = false;
            
            foreground = map.createLayer('Foreground');
            foreground.resizeWorld();
            foreground.wrap = false;
            console.log("==preload state. Create method");

        }
    }