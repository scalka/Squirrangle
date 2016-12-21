var game; // contains game
var map;
var cursors;
var foreground, background;
var stand, walk, jump, die;
var candy, bin, nut, pond, mower;

window.onload = function () {
    console.log("==onload event");
    //populates game 3rd argument handles resizing auto-streched
    game = new Phaser.Game(640, 960, Phaser.AUTO, "");
    //adding states to the phaser game
    game.state.add("Boot", boot);
    game.state.add("Preload", preload);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
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
            // background
            game.load.tilemap('map', '../asset/tilemaps/tiles_background.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', '../asset/tiles/tiles_background.png');
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
            //creating a tiled background 
            map = game.add.tilemap('map', 640, 900);
            map.addTilesetImage('background_image', 'tiles');
            background = map.createLayer('background_layer');

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
            map = game.add.tilemap('map', 640, 900);
            map.addTilesetImage('background_image', 'tiles');
            background = map.createLayer('background_layer');
            background.resizeWorld();
            background.warp = false;

            this.stand = game.add.sprite(0, 180, 'squirrangle', 'stand/stand1');
            // walk = game.add.sprite(0,300, 'squirrangle', 'walk/walk1');
            this.jump = game.add.sprite(0,500, 'squirrangle', 'jump/jump1');
            this.jump.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 5, true);
            this.jump.animations.play('jump');
            this.game.physics.arcade.enable(this.jump);
            this.pond = game.add.sprite(300, 400, 'squirrangle', 'pond');
            this.nut = game.add.sprite(500, 500, 'squirrangle', 'nut');
            /*TODO redo standing squirrel - it looks ridicul*/
            /*this.stand.animations.add('stand', Phaser.Animation.generateFrameNames('stand/stand', 1,2), 5, true);
            this.stand.animations.play('stand');*/

            this.game.physics.arcade.enable(this.jump);

        },
        update: function(){
            if (cursors.left.isDown)
            {   
               this.jump.body.x -= 4;
                game.camera.x -= 4;
            }
            else if (cursors.right.isDown)
            {
                this.jump.body.x += 4;
                game.camera.x += 4;
            }

            if (cursors.up.isDown)
            {
                this.jump.body.x = 4;
                game.camera.y -= 4;
            }
            else if (cursors.down.isDown)
            {
                this.jump.body.x = 4;
                game.camera.y += 4;
            }
        },
        jump: function(){
            /*this.jump = game.add.sprite(0,500, 'squirrangle', 'jump/jump1');
            this.jump.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 5, true);
            this.jump.animations.play('jump');
            this.game.physics.arcade.enable(this.jump);*/
            /*this.jump.body.bounce.y = 0.2;
            this.jump.body.gravity.y = 2000;
            this.jump.body.gravity.x = 20;
            this.jump.body.velocity.x = 100;*/
        }, 
        walk: function(){
            this.walk.animations.add('walk', Phaser.Animation.generateFrameNames('walk/walk', 1,3), 5, true);
            this.walk.animations.play('walk')
        }

    }    

