var game; // contains game
var points = 0; // score
var text; // score text on top of page
var map; // contains map
var cursors; 
var nutsGroup, trapGroup; // objects layers
var blockedLayer, blockedlayer, backgroundlayer, backgroundLayer; // layers
var squirrel, stand, walk, jump, die; // squirrel and movement sprites
var candy, bin, nut, nuts, pond, mower; // objects
var hold, up, down, left, right, direction; // flags for movement


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
            game.load.image('trapImage', 'asset/objects/trap.png')
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
            this.createTraps();
            
            this.squirrel = game.add.sprite(0, 180, 'squirrangle', 'stand/stand1');
            this.game.physics.arcade.enable(this.squirrel);

            this.game.physics.enable(this.squirrel, Phaser.Physics.ARCADE);
            
            this.game.input.onDown.add(this.listenSwipe, this);
            
            
            
            //camera follows squirrel
            this.game.camera.follow(this.squirrel);

            //text containing points
            this.text = game.add.text(10 , 10, "Points: " + points, { font: "45px Arial", fill:  "#FF7256", align: "center" } );
            this.text.fixedToCamera = true;
        },
        // create nuts objects from tiled map
        createNuts: function(){
            this.nutsGroup = this.game.add.group();
            this.nutsGroup.enableBody = true;
            var createNuts = this.findObjectsByType('point', this.map, 'nutsL');
            createNuts.forEach(function(element){
                this.createSpriteFromTiledObject(element, this.nutsGroup, 'nutImage');
            }, this);
        },
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
        jumpSquirrel: function(){
            //console.log("==jumpSquirrel");
                this.squirrel.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 10, false);
                this.squirrel.animations.play('jump');
                this.squirrel.animations.currentAnim.onComplete.add(this.walkSquirrel, this);
                this.game.physics.arcade.enable(this.squirrel);
                    
        },
        walkSquirrel: function(){
            //console.log("==walkSquirrel");
            this.squirrel.canJump = false;
            this.squirrel.canWalk = true;
            if(this.squirrel.canWalk){
                this.squirrel.animations.add('walk', Phaser.Animation.generateFrameNames('walk/walk', 1,3), 2, true);
                this.squirrel.animations.play('walk');
                this.game.physics.arcade.enable(this.squirrel);
            }
        },
        die: function(squirrel, trap){
            console.log("trap");
            
            this.squirrel.body.bounce.y = 0.2;
            this.squirrel.body.gravity.y = 2000;
            this.squirrel.body.gravity.x = 20;
            this.squirrel.body.velocity.x = 100;
            game.time.events.add(Phaser.Timer.SECOND*2, function() {
                game.state.start("GameOverScreen");
            });
        }, 
        
        update: function(){
            //console.log("===update function")
           this.listenSwipe(function(direction) {
                console.log("outside of if listen swipe: " + direction);
                return direction;
            });      
            this.game.physics.arcade.overlap(this.squirrel, this.nutsGroup, this.collision, null, this);
            this.game.physics.arcade.overlap(this.squirrel, this.trapGroup, this.die, null, this);
           
            this.text.setText("Points: " + points);

            if (this.game.input.activePointer.isDown){
                //console.log("is down");
                this.game.input.onDown.add(this.jumpSquirrel, this);
                this.squirrel.x +=1;
            }
            
            this.game.input.onUp.add(this.listenSwipe, this);
        },
        listenSwipe: function(callback) {
            var eventDuration;
            var startPoint = {};
            var endPoint = {};    
            var minimum = {
                 duration: 10,
                 distance: 10
            }   

            this.game.input.onDown.add(function(pointer) {
                startPoint.x = pointer.clientX;     
                startPoint.y = pointer.clientY; 
            }, this);
            
            this.game.input.onUp.add(function(pointer) {     
                direction = '';     
                eventDuration = game.input.activePointer.duration;    
                if (eventDuration > minimum.duration) {
                    
                    endPoint.x = pointer.clientX;           
                    endPoint.y = pointer.clientY;           // Check direction   
                    console.log(pointer.clientX);
                    console.log(endPoint.y);
                    if (endPoint.y - startPoint.y > minimum.distance) { 
                        console.log(endPoint.y);
                        direction = 'bottom';  
                        this.squirrel.y -= 10;
                        console.log("swipe bottom")
                        
                    } else if (startPoint.y - endPoint.y > minimum.distance) {           
                        direction = 'top'; 
                        console.log("top");
                        this.squirrel.y += 1;
                    }     
                }
            }, this);
           console.log(direction);
            if (direction == 'top')
            {
                 console.log(direction + "  top");
                this.squirrel.y += 14;
            }
            else if (direction == 'bottom')
            {
                console.log(direction + "  bottom");
                this.squirrel.y -= 14;
            }

        },  

        collision: function(squirrel, object){
            console.log("collision");
            points += 1;
            object.destroy();
        },
        
        
        
 }
var gameOverScreen = function (game){};
    gameOverScreen.prototype = {
        //Checking Collisions
        create: function(){
            console.log("==gameOverScreen state. Create method");
        }
};
    