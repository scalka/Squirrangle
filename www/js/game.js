var game; // contains game
var points = 0;
var text;
var map;
var cursors;
var nutsGroup, n;
var blockedLayer, blockedlayer, backgroundlayer, backgroundLayer, candyLayer, candylayer, trapsLayer, trapslayer, nutsLayer;
var squirrel, stand, walk, jump, die;
var candy, bin, nut, nuts, pond, mower;
var hold, up, down, left, right, direction;
var type;


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
            game.load.tilemap('level1', 'asset/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'asset/tiles/tiles_spritesheet.png');
            
            //foreground
            game.load.image('objectsTiles', 'asset/tiles/objects.png');
            //sprites
            game.load.atlasJSONArray('squirrangle', 'asset/squirrangle.png', 'asset/squirrangle.json');
            console.log("==preload state. Preload method");
            //title screen
            game.load.image('title', 'asset/objects/title.png');
            game.load.image('play', 'asset/objects/play.png');
            game.load.image('nutImage', 'asset/objects/nut.png');
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
            
            /*this.nutlayer = this.map.createLayer('nutsLayer');
            this.candylayer = this.map.createLayer('candyLayer');
            this.trapslayer = this.map.createLayer('trapsLayer');*/
            
            //collision on blockedLayer - The first two parameters specify a range of tile ids
            //this.map.setCollisionBetween(1, 100000, true, 'blockedlayer');
            this.map.setCollisionBetween(0, 850, true, this.nutlayer);
            
            //resizes the game world to match the layer dimensions
            this.backgroundlayer.resizeWorld();
            this.backgroundlayer.warp = false;
             this.createNuts();
        
            this.squirrel = game.add.sprite(0, 180, 'squirrangle', 'stand/stand1');
            this.game.physics.arcade.enable(this.squirrel);
            
            
            this.squirrel.canJump = true;
            this.squirrel.canWalk = false; 
            
            this.squirrel.hold = false;
            this.squirrel.up = false;
            this.squirrel.down = false;
            this.squirrel.left = false;
            this.squirrel.right = false;
            
            /*this.squirrel.animations.add('stand', Phaser.Animation.generateFrameNames('stand/stand', 1,2), 5, true);
            this.squirrel.animations.play('stand');
            */
            this.game.physics.enable(this.squirrel, Phaser.Physics.ARCADE);
            

            
            game.input.onDown.add(this.jumpSquirrel, this); // react to tap or click
            //swipe sets flag to false
            game.input.onUp.add(this.walkSquirrel, this);

            this.game.camera.follow(this.squirrel);

            
          this.text = game.add.text(10 , 10, "Points: " + points, { font: "45px Arial", fill:                      "#FF7256", align: "center" } );
            this.text.fixedToCamera = true;

           
            
        },
        
        createNuts: function(){
            this.nutsGroup = this.game.add.group();
            this.nutsGroup.enableBody = true;
            var nut;
            var createNuts = this.findObjectsByType('point', this.map, 'nutsL');
            createNuts.forEach(function(element){
                this.createSpriteFromTiledObject(element, this.nutsGroup);
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
        createSpriteFromTiledObject: function (element, group) {
            var newSprite = group.create(element.x, element.y, 'nutImage');
            Object.keys(element.properties).forEach(function (key) {
                newSprite[key] == element.properties[key];
            });
        },
        

        
        
        jumpSquirrel: function(){
            //console.log("==jumpSquirrel");
            this.squirrel.canWalk = false;
            this.squirrel.canJump = true;
            if(this.squirrel.canJump){
                this.squirrel.animations.add('jump', Phaser.Animation.generateFrameNames('jump/jump', 1,3), 5, true);
                this.squirrel.animations.play('jump');
                this.game.physics.arcade.enable(this.squirrel);
            }            
        },
        walkSquirrel: function(){
            //console.log("==walkSquirrel");
            this.squirrel.canJump = false;
            this.squirrel.canWalk = true;
            if(this.squirrel.canWalk){
                this.squirrel.animations.add('walk', Phaser.Animation.generateFrameNames('walk/walk', 1,3), 5, true);
                this.squirrel.animations.play('walk');
                this.game.physics.arcade.enable(this.squirrel);
            }
        },
        die: function(){
            /*this.squirrel.body.bounce.y = 0.2;
                this.squirrel.body.gravity.y = 2000;
                this.squirrel.body.gravity.x = 20;
                this.squirrel.body.velocity.x = 100;*/
        },  
        
        update: function(){
            //console.log("===update function")
           /* listenSwipe(function(direction) {
                console.log("outside of if listen swipe: " + direction);
                return direction;
            });*/            
            
            this.game.physics.arcade.overlap(this.squirrel, this.nutsGroup, this.collision, null, this);
           
            this.text.setText("Points: " + points);
            console.log(points);
            
            this.game.input.onUp.add(this.listenSwipe, this);

            if (cursors.left.isDown)
            {   
                console.log(" keyboard left");
            }
            else if (cursors.right.isDown || game.input.activePointer.isDown)
            {   
                console.log("keyboard hold")
               // game.camera.x +=4;
                this.squirrel.x +=4;
            }
            if (cursors.up.isDown)
            {
                 console.log("keyboard top")
                this.squirrel.y += 4;
               // this.squirrel.body.velocity.y = -100;
                //game.camera.y -= 4;
            }
            else if (cursors.down.isDown)
            {
                 console.log("keyboard bottom")
                this.squirrel.y -= 4;
               // game.camera.y += 4;
            }
        },
        collision: function(squirrel, object){
            console.log("collision");
            points += 1;
            object.destroy();
        },
        
        listenSwipe: function(callback) {
            var eventDuration;
            var startPoint = {};
            var endPoint = {};    
            var minimum = {
                 duration: 25,
                 distance: 50
            }   
            game.input.onDown.add(function(pointer) {
                startPoint.x = pointer.clientX;     
                startPoint.y = pointer.clientY; 
            }, this);   
            game.input.onUp.add(function(pointer) {     
                direction = '';     
                eventDuration = game.input.activePointer.duration;      
                if (eventDuration > minimum.duration) {         
                    endPoint.x = pointer.clientX;           
                    endPoint.y = pointer.clientY;           // Check direction   
                    if (endPoint.x - startPoint.x > minimum.distance) {             
                        return direction = 'right';  
                        console.log(" return direction = 'right';  ");
                    } else if (startPoint.x - endPoint.x > minimum.distance) {              
                        direction = 'left';         
                    } else if (endPoint.y - startPoint.y > minimum.distance) {              
                        direction = 'bottom';           
                    } else if (startPoint.y - endPoint.y > minimum.distance) {              
                        direction = 'top'; 
                        console.log("tpppp");
                    }     
                }
            }, this);
            if (direction == 'left')
            {   
                this.squirrel.x -= 14;
                console.log("swipe left");
            }
            if (direction == 'top')
            {
                 console.log("swipe top")
                this.squirrel.y += 14;
            }
            else if (direction == 'bottom')
            {
                console.log("swipe bottom")
                this.squirrel.y -= 14;
            }

        },  
        
        
 }
    