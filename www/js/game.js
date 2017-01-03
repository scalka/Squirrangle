var game; // contains game
var map;
var cursors;
var blockedLayer, blockedlayer, backgroundlayer, backgroundLayer;
var stand, walk, jump, die;
var candy, bin, nut, pond, mower;

window.onload = function () {
    console.log("==onload event");
    //populates game 3rd argument handles resizing auto-streched
    game = new Phaser.Game(746, 420, Phaser.AUTO, "");
    //adding states to the phaser game
    game.state.add("Boot", boot);
    game.state.add("Preload", preload);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
    //game.state.add("GameOverScreen", gameOverScreen);
    //kickstart the game with Boot state
    game.state.start("Boot");
};
// the boot state is an object with a prototype method and it accepts the game object as an argument, general settings are defined and the assets of the preloading ex. loading bar, nothing is displayed to the user
var boot = function(game){};
    boot.prototype = { // methods are run automatically by phaser -preload, create etc
        //preload function runs before the create function
        preload: function () {
            console.log("==boot state. Preload method");
            //preloading an asset that will be a preloading bar
            this.game.load.image("loading", "asset/preload.png"); 
        },
        //create function sets up how the gamescreen is positioned
        create: function () {
            console.log("==boot state. Create method");
            // keep original aspect ratio while maximising size in browser
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            //triggering the next state
            this.game.state.start("Preload");
        }
    };
//Preload state: loads into memory assets, dipsays a loadingbar. 
var preload = function(game){};
    preload.prototype = {
        preload: function() {
            //show loading screen
            this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loading');
            /*anchor point is the point that will remain in the same part of the screen after transformation ex. rotation, shrink happens*/
            this.preloadBar.anchor.setTo(0.5);
            /*loading grows*/
            this.load.setPreloadSprite(this.preloadBar); 
            
            // Here we load the assets required for our preloader (in this case a 
            
            // background
            game.load.tilemap('level1', '../asset/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', '../asset/tiles/tiles_spritesheet.png');
            
            //foreground
            game.load.image('objectsTiles', '../asset/tiles/objects.png');
            //sprites
            game.load.atlasJSONArray('squirrangle', '../asset/squirrangle.png', '../asset/squirrangle.json');
            console.log("==preload state. Preload method");
            //title screen
            game.load.image('title', '../asset/objects/title.png');
            game.load.image('play', '../asset/objects/play.png');
        },
        create: function(){
            this.game.state.start("TitleScreen");
            

        }
    };
    //title state    
var titleScreen = function(game){};
    titleScreen.prototype = {
        create: function(){
            console.log("==title Screen state. Create method");
/*            //creating a tiled background 
            this.map = game.add.tilemap('level1');
            
            this.map.addTilesetImage('tiles_spritesheet', 'tiles');
            this.backgroundLayer = map.createLayer('backgroundLayer');*/

            //title
            var title = game.add.image(game.width/2, 300, "title");
            title.anchor.set(0.5);
            //playbutton
            var playButton = game.add.button(game.width/2, game.height/2, "play", this.startGame);
            playButton.anchor.set(0.5);
            //adding tween to the button
            var tween = game.add.tween(playButton).to({
                width: 220,
                height: 220
            }, 1500, "Linear", true, 0, -1);
            tween.yoyo(true);
        },
        //will be triggered by button interaction
        startGame: function(){
            console.log("==title Screen state. startGame method");
            game.state.start("PlayGame");
        }
    };
var playGame = function(game){};
    playGame.prototype = {
        create: function(){
            // keyboard input
            cursors = game.input.keyboard.createCursorKeys();
            // background - tilemap
            this.map = this.game.add.tilemap('level1');
            //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
            this.map.addTilesetImage('tiles_spritesheet', 'tiles');
            this.map.addTilesetImage('objects', 'objectsTiles')
            //create layers
            this.backgroundlayer = this.map.createLayer('backgroundLayer');
            this.blockedlayer = this.map.createLayer('blockedLayer');
            //collision on blockedLayer - The first two parameters specify a range of tile ids
            this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');
            
            //resizes the game world to match the layer dimensions
            this.backgroundlayer.resizeWorld();
            this.backgroundlayer.warp = false;


            this.stand = game.add.sprite(0, 180, 'squirrangle', 'stand/stand1');
            // walk = game.add.sprite(0,300, 'squirrangle', 'walk/walk1');
            this.jump = game.add.sprite(0,500, 'squirrangle', 'jump/jump1');
            this.jump.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 5, true);
            this.jump.animations.play('jump');
            this.game.physics.arcade.enable(this.jump);

            this.nut = game.add.sprite(250, 500, 'squirrangle', 'nut');
            /*TODO redo standing squirrel - it looks ridicul*/

            this.stand.animations.add('stand', Phaser.Animation.generateFrameNames('stand/stand', 1,2), 5, true);
            this.stand.animations.play('stand');

            this.game.physics.arcade.enable(this.jump);


        },
        update: function(){
            if (cursors.left.isDown)
            {   
               this.jump.body.x -= 4;
              //  game.camera.x -= 4;
            }
            else if (cursors.right.isDown)
            {
                this.jump.body.x += 4;
                game.camera.x += 4;
            }

            if (cursors.up.isDown)
            {
                this.jump.body.x = 4;
                //game.camera.y -= 4;
            }
            else if (cursors.down.isDown)
            {
                this.jump.body.x = 4;
                game.camera.y += 4;
            }
        },
        jump: function(){
            this.jump = game.add.sprite(0,500, 'squirrangle', 'jump/jump1');
            this.jump.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 5, true);
            this.jump.animations.play('jump');
            this.game.physics.arcade.enable(this.jump);
            this.jump.body.bounce.y = 0.2;
            this.jump.body.gravity.y = 2000;
            this.jump.body.gravity.x = 20;
            this.jump.body.velocity.x = 100;
        }, 
        walk: function(){
            this.walk.animations.add('walk', Phaser.Animation.generateFrameNames('walk/walk', 1,3), 5, true);
            this.walk.animations.play('walk')
        }

    }    

