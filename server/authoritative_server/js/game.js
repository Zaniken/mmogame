const playerObjects = {};
const sugarObjects = {};
const eggObjects = {};

var test;

const config = {
    type: Phaser.HEADLESS,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    autoFocus: false,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload() {
    // this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.spritesheet('queen', 'assets/ant.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sugar', 'assets/sugar.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('egg', 'assets/egg.png', { frameWidth: 32, frameHeight: 32 });

}


function create() {
    const self = this;
    this.playerPhaserObjects = this.physics.add.group();
    io.on('connection', function(socket) {
        console.log('a user connected');
        // create a new player and add it to our players object
        playerObjects[socket.id] = new Queen(socket.id);
        // add player to server
        addPlayer(self, playerObjects[socket.id]);
        // send the players object to the new player
        socket.emit('currentObjects', playerObjects);
        socket.emit("currentObjects", sugarObjects);
        socket.emit('currentObjects', eggObjects);
        // update all other players of the new player
        socket.broadcast.emit('newObj', playerObjects[socket.id]);
        socket.on('disconnect', function() {
            console.log('user disconnected');
            // remove player from server
            removePlayer(self, socket.id);
            // remove this player from our players object
            delete playerObjects[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnectUser', socket.id);
        });
        // when a player moves, update the player data
        socket.on('playerInput', function(inputData) {
            handlePlayerInput(self, socket.id, inputData);
            console.log("E pressed: " + inputData.e + " Q pressed: " + inputData.q);
        });

        //target input for playermovement
        socket.on('playerTarget', function(target) {
            //  console.log("Socket read click")
            handlePlayerInput2(self, socket.id, target);

        });
    });

    // sugar timer stuff 
    this.sugarPhaserObjects = this.physics.add.group();
    this.eggPhaserObjects = this.physics.add.group();
    test = this;
    //this.monsterTimer = game.time.events.loop(Phaser.Timer.SECOND, this.addMonster, this); <- old ps2 
    this.timedEventSugar = this.time.addEvent({ delay: 10000, callback: makeSugar, callbackScope: this, loop: true });

    //collision stuff
    this.physics.add.overlap(this.sugarPhaserObjects, this.playerPhaserObjects, antSugar);
}

//player eating sugar
function antSugar(sugarPhaser, playerPhaser) {
    // console.log(playerObjects); var = {obj qeen queen}
    //console.log(sugarObjects); var {1: sugar, 2: sugar}
    // console.log(this.sugars); == undefined
    // console.log(this.players); == undefined
    if (playerObjects[playerPhaser.id].input.e) {
        playerObjects[playerPhaser.id].input.e = false;
        console.log("attcking sugar");
        sugarObjects[sugarPhaser.id].takeDamage();
        playerObjects[playerPhaser.id].getHealth();
        playerObjects[playerPhaser.id].getEnergy();
        if (sugarObjects[sugarPhaser.id].hp <= 0) {

            io.emit('destroyObject', sugarObjects[sugarPhaser.id]);
            sugarPhaser.destroy();

            delete sugarObjects[sugarPhaser.id];
        }
    }
}
var objectIdCounter = 0;

function makeSugar() {
    var self = this;
    objectIdCounter++;
    sugarObjects[objectIdCounter] = new Sugar(objectIdCounter);
    const sugar = self.physics.add.image(sugarObjects[objectIdCounter].x, sugarObjects[objectIdCounter].y, 'sugar').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    sugar.id = objectIdCounter;
    self.sugarPhaserObjects.add(sugar);
    io.emit('newObj', sugarObjects[objectIdCounter]);
    console.log("Sugar function called " + sugarObjects[objectIdCounter].x);
}
//var objectIdCounter = 0;

function makeEgg(player) {
    // var self = this;
    console.log("makeegg was ran");
    objectIdCounter++;
    eggObjects[objectIdCounter] = new Egg(objectIdCounter, playerObjects[player.id].team, player.x, player.y);
    console.log(eggObjects[objectIdCounter]);
    const egg = test.physics.add.image(eggObjects[objectIdCounter].x, eggObjects[objectIdCounter].y, 'egg').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    egg.id = objectIdCounter;
    test.eggPhaserObjects.add(egg);
    io.emit('newObj', eggObjects[objectIdCounter]);
    console.log("egg function called " + eggObjects[objectIdCounter].x);


    test.time.addEvent({ delay: 10000, callback: hatchEgg(egg), callbackScope: this, loop: false });

}

function hatchEgg(eggAsset) {
    //make an ant
    //delete egg

    io.emit('destroyObject', eggObjects[eggAsset.id]);
    eggAsset.destroy();

    delete sugarObjects[sugarPhaser.id];



}


function update() {
    this.playerPhaserObjects.getChildren().forEach((player) => {
        const input = playerObjects[player.id].input;

        //   console.log(players[player.id].target.x + " , " + players[player.id].target.y)

        if (player.body.speed > 0) {

            var distance = Phaser.Math.Distance.Between(player.x, player.y, playerObjects[player.id].target.x, playerObjects[player.id].target.y);

            //  4 is our distance tolerance, i.e. how close the source can get to the target
            //  before it is considered as being there. The faster it moves, the more tolerance is required.
            if (distance < 4) {
                // player.body.reset(target.x, target.y);
                player.setAcceleration(0);
                player.setVelocity(0);
                playerObjects[player.id].moving(false);
            }
        }
        //lay egg 
        if (input.q) {
            input.q = false;
            console.log("Debug: Trying to lay egg");
            if (playerObjects[player.id].layEgg()) {
                //  console.log("Debug: Trying to lay egg inner loop check");
                //TODO Test is makeEGG is allowed here?
                makeEgg(player);
            }
        }
        // if (input.left) {
        //     player.setAngularVelocity(-300);
        // } else if (input.right) {
        //     player.setAngularVelocity(300);
        // } else {
        //     player.setAngularVelocity(0);
        // }
        // if (input.up) {
        //     this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        //     players[player.id].moving(true);
        // } else {
        //     players[player.id].moving(false);
        //     player.setAcceleration(0);
        //     player.setVelocity(0);

        // }
        playerObjects[player.id].x = player.x;
        playerObjects[player.id].y = player.y;
        playerObjects[player.id].rotation = player.rotation;
    });
    this.physics.world.wrap(this.playerPhaserObjects, 5);
    //var objects = { players, sugars };
    io.emit('playerUpdates', playerObjects);

}

function handlePlayerInput(self, id, input) {
    self.playerPhaserObjects.getChildren().forEach((player) => {
        if (id === player.id) {
            playerObjects[player.id].input = input;
        }
    });
}

function handlePlayerInput2(self, id, target) {
    self.playerPhaserObjects.getChildren().forEach((player) => {
        if (id === player.id) {
            playerObjects[player.id].target = target;
            self.physics.moveToObject(player, target, 200);
            playerObjects[player.id].moving(true);


            //rotation
            var angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(player.x, player.y, playerObjects[player.id].target.x, playerObjects[player.id].target.y);
            player.setAngle(angle + 270 + 1);

        }
    });



}



function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'queen').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    player.setDrag(100);
    // player.setAngularDrag(100);
    // player.setMaxVelocity(200);
    player.id = playerInfo.id;
    self.playerPhaserObjects.add(player);
}

function removePlayer(self, id) {
    self.playerPhaserObjects.getChildren().forEach((player) => {
        if (id === player.id) {
            player.destroy();
        }
    });
}
const game = new Phaser.Game(config);
window.gameLoaded();