var game; // contains game
var points = 0; // score
var text, textGameOver; // score text on top of page
var map; // contains map
var cursors; //keyboard input
var nutsGroup, trapGroup; // objects layers
var blockedLayer, blockedlayer, backgroundlayer, backgroundLayer; // layers
var squirrel, stand, walk, jump, die; // squirrel and movement sprites
var candy, bin, nut, nuts, pond, mower; // objects
var hold, up, down, left, right, direction; // flags for movement
var pointSound; // sound

window.onload = function () {
    console.log("==onload event");
    //populates game 3rd argument handles resizing auto-streched
    game = new Phaser.Game(746, 420, Phaser.AUTO, "");
    //adding states to the phaser game
    game.state.add("Boot", boot);
    game.state.add("Preload", preload);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
    game.state.add("GameOverScreen", gameOverScreen);
    //start the game with Boot state
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
            console.log("==preload state. Preload method");
            //show loading screen
            this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loading');
            /*anchor point is the point that will remain in the same part of the screen after transformation ex. rotation, shrink happens*/
            this.preloadBar.anchor.setTo(0.5);
            /*loading grows*/
            this.load.setPreloadSprite(this.preloadBar); 
            // background
            game.load.tilemap('level1', 'asset/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'asset/tiles/tiles_spritesheet.png');            
            //foreground
            game.load.image('objectsTiles', 'asset/tiles/objects.png');
            //sprites
            game.load.atlasJSONArray('squirrangle', 'asset/squirrangle.png', 'asset/squirrangle.json');
            //title screen
            game.load.image('title', 'asset/objects/title.png');
            game.load.image('play', 'asset/objects/play.png');
            // objects
            game.load.image('nutImage', 'asset/objects/nut.png');
            game.load.image('trapImage', 'asset/objects/trap.png');
            //audio
            game.load.audio('pointAudio', 'asset/audio/sound.ogg', 'asset/audio/sound.ogg');

        },
        create: function(){
            //starting title screen state
            this.game.state.start("TitleScreen");
        }
    };
//title state    
var titleScreen = function(game){};
    titleScreen.prototype = {
        create: function(){
            console.log("==title Screen state. Create method");
            //creating a tiled background 
            //add json file
            this.map = this.game.add.tilemap('level1');
            //add png sptiesheet image 
            this.map.addTilesetImage('tiles_spritesheet', 'tiles');
            //create layer
            this.backgroundlayer = this.map.createLayer('backgroundLayer');
            //title
            var title = game.add.image(game.width/2, 300, "title");
            title.anchor.set(0.5);
            //playbutton
            var playButton = game.add.button(game.width/2, game.height/3, "play", this.startGame);
            playButton.anchor.set(0.5);
            //adding tween to the button
            var tween = game.add.tween(playButton).to({
                width: 220,
                height: 220
            }, 1500, "Linear", true, 0, -1);
            tween.yoyo(true);
        },
        // start game will be triggered by button interaction
        startGame: function(){
            console.log("==title Screen state. startGame method");
            game.state.start("PlayGame");
        }
    };
//actual game
var playGame = function(game){};
    playGame.prototype = {
        create: function(){
            console.log("==playGame. create method");    
            //Start the Arcade Physics systems
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            //setting the edges of the world
            this.game.world.setBounds(0, 0, this.game.width, this.game.height);
            // keyboard input
            cursors = game.input.keyboard.createCursorKeys();
            // background - tilemap
            this.map = this.game.add.tilemap('level1');
            //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
            this.map.addTilesetImage('tiles_spritesheet', 'tiles');
            this.map.addTilesetImage('objects', 'objectsTiles');
            //create layers
            this.backgroundlayer = this.map.createLayer('backgroundLayer');
            this.blockedlayer = this.map.createLayer('blockedLayer');
            //resizes the game world to match the layer dimensions
            this.backgroundlayer.resizeWorld();
            this.backgroundlayer.warp = false;
            //create nuts objects
            this.createNuts();
            //traps objects
            this.createTraps();
            //create squirrel
            this.squirrel = game.add.sprite(0, 180, 'squirrangle', 'stand/stand1');
            //enable physics on squirrel
            this.game.physics.arcade.enable(this.squirrel);
            // world bounds collision
            this.squirrel.body.collideWorldBounds = true;
            //on click/tap listenSwipe is listenining for swipes
            this.game.input.onDown.add(this.listenSwipe, this);
            //camera follows squirrel
            this.game.camera.follow(this.squirrel);
            //text containing points on top of the screen
            this.text = game.add.text(10 , 10, "Points: " + points, { font: "45px Arial", fill:  "#FF7256", align: "center" } );
            this.text.fixedToCamera = true;
        },
        //create nuts objects from tiled map
        createNuts: function(){
            //adding group of objects
            this.nutsGroup = this.game.add.group();
            this.nutsGroup.enableBody = true;
            //finding in the json file type of points on the nut layer
            var createNuts = this.findObjectsByType('point', this.map, 'nutsL');
            //for each of the element with type point exachange it with a nut sprite
            createNuts.forEach(function(element){
                this.createSpriteFromTiledObject(element, this.nutsGroup, 'nutImage');
            }, this);
        },
        //similar function as createNuts, but with traps
        createTraps: function(){
            this.trapGroup = this.game.add.group();
            this.trapGroup.enableBody = true;
            var createTraps = this.findObjectsByType('trap', this.map, 'trapL');
            createTraps.forEach(function(element){
                this.createSpriteFromTiledObject(element, this.trapGroup, 'trapImage');
            }, this);
        },
        //find objects in the layer from Tiled
        findObjectsByType: function(sprite, map, layer){
            var result = new Array();
            map.objects[layer].forEach(function (element) {
                if (element.properties.sprite === sprite) {
                    element.y -= map.tileHeight;
                    result.push(element);
            }
            });
            return result;
        },
        //creating sprites from the tiled object layer
        createSpriteFromTiledObject: function (element, group, image) {
            var newSprite = group.create(element.x, element.y, image);
            Object.keys(element.properties).forEach(function (key) {
                newSprite[key] == element.properties[key];
            });
        },    
        //animation for jumping squirrel
        jumpSquirrel: function(){
            //adding animation with frames based on the json file
            this.squirrel.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 20, false);
            this.squirrel.animations.play('jump');
            //on animation complete add walkSwuirrel function
            this.squirrel.animations.currentAnim.onComplete.add(this.walkSquirrel, this);            
        },
        //walking squirrel animation
        walkSquirrel: function(){
            this.squirrel.canJump = false;
            this.squirrel.canWalk = true;
            if(this.squirrel.canWalk){
                this.squirrel.animations.add('walk', Phaser.Animation.generateFrameNames('walk/walk', 1,3), 2, true);
                this.squirrel.animations.play('walk');
            }
        },
        //function when the squirrel collided with trap
        die: function(squirrel, trap){
            this.squirrel.body.bounce.y = 0.2;
            this.squirrel.body.gravity.y = 2000;
            this.squirrel.body.gravity.x = 20;
            this.squirrel.body.velocity.x = 100;
            game.time.events.add(Phaser.Timer.SECOND, function() {
                game.state.start("GameOverScreen");
            });
        }, 
        //update function
        update: function(){
            //listening for swipes
           this.listenSwipe(function(direction) {
                return direction;
            });
            //setting collisions between swuirrel and nuts and traps
            this.game.physics.arcade.overlap(this.squirrel, this.nutsGroup, this.collision, null, this);
            this.game.physics.arcade.overlap(this.squirrel, this.trapGroup, this.die, null, this);
            //updating points text
            this.text.setText("Points: " + points);
            //listening for tap/click event
            if (this.game.input.activePointer.isDown){
                this.game.input.onDown.add(this.jumpSquirrel, this);
                //increase velocity on tap
                this.squirrel.body.velocity.x +=2;
            }
            //on click up listening for swipe
            this.game.input.onUp.add(this.listenSwipe, this);
        },
        //functions which is detecting swipes
        listenSwipe: function(callback) {
            var eventDuration;
            var startPoint = {};
            var endPoint = {};  
            //min duration and distance of swipe
            var minimum = {
                 duration: 10,
                 distance: 10
            }   
            //catching coordinates on down event
            this.game.input.onDown.add(function(pointer) {
                startPoint.x = pointer.clientX;     
                startPoint.y = pointer.clientY; 
            }, this);
            //catching coordinates on up event
            this.game.input.onUp.add(function(pointer) {     
                direction = '';     
                eventDuration = game.input.activePointer.duration;    
                if (eventDuration > minimum.duration) {                  
                    endPoint.x = pointer.clientX;           
                    endPoint.y = pointer.clientY;           
                    // Check direction   
                    if (endPoint.y - startPoint.y > minimum.distance) { 
                        direction = 'bottom';  
                        //move down
                        this.squirrel.y += 0.2;
                        //reset velocity
                        this.squirrel.body.velocity.x = 0;                    
                    } else if (startPoint.y - endPoint.y > minimum.distance) {           
                        direction = 'top'; 
                        //reset velocity
                        this.squirrel.body.velocity.x = 0;
                        //move up
                        this.squirrel.y -= 0.2;   
                    }     
                }
            }, this);
        },  
        //collision function
        collision: function(squirrel, object){
            //play sound
            this.pointSound = this.game.add.audio('pointAudio');
            this.pointSound.play();
            //increase points
            points += 1;
            //destroy nut
            object.destroy();
        }        
 }
//game over state and screen    
var gameOverScreen = function (game){};
    gameOverScreen.prototype = {
        //Checking Collisions
        create: function(){
            console.log("==gameOverScreen state. Create method");
            this.text = game.add.text(100 , game.height/2, "GAME OVER: " + points + " points", { font: "45px Source Sans Pro", fill:  "#fff200", align: "center" } );        
        }
};
    
