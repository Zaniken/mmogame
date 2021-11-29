const everyObject = {};

var phaserContainer = {};

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
    this.load.spritesheet('ant', 'assets/ant.png', { frameWidth: 32, frameHeight: 32 });
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
        //  everyObject[socket.id] = new Queen(socket.id);


        socket.on('initPlayer', function(playername) {
            everyObject[socket.id] = new Queen(playername, socket.id);
            console.log("Init player ran " + playername);
            addPlayer(self, everyObject[socket.id]);
            socket.emit('currentObjects', everyObject);

        });



        // add player to server

        // send the players object to the new player
        socket.emit('currentObjects', everyObject);

        // update all other players of the new player
        socket.broadcast.emit('newObj', everyObject[socket.id]);
        socket.on('disconnect', function() {
            console.log('user disconnected');

            removeObject(everyObject[socket.id]);

        });
        // when a player moves, update the player data
        socket.on('playerInput', function(inputData) {
            handlePlayerInput(self, socket.id, inputData);
            console.log("E pressed: " + inputData.e + " Q pressed: " + inputData.q);
        });

        //target input for playermovement
        socket.on('playerTarget', function(target) {
            //  console.log("Socket read click")
            setPhaserMoveTo(everyObject[socket.id], target);

        });
    });

    // sugar timer stuff 
    this.sugarPhaserObjects = this.physics.add.group();
    this.eggPhaserObjects = this.physics.add.group();
    this.antPhaserObjects = this.physics.add.group();
    phaserContainer = { sugars: this.sugarPhaserObjects, eggs: this.eggPhaserObjects, players: this.playerPhaserObjects, ants: this.antPhaserObjects };
    test = this;
    //this.monsterTimer = game.time.events.loop(Phaser.Timer.SECOND, this.addMonster, this); <- old ps2 
    this.timedEventSugar = this.time.addEvent({ delay: 5000, callback: makeSugar, callbackScope: this, loop: true });

    //collision stuff for player
    this.physics.add.overlap(this.sugarPhaserObjects, this.playerPhaserObjects, attack);
    this.physics.add.overlap(this.eggPhaserObjects, this.playerPhaserObjects, attack);
    this.physics.add.overlap(this.antPhaserObjects, this.playerPhaserObjects, attack);

    //collision stuff for ants
    this.physics.add.overlap(this.antPhaserObjects, this.antPhaserObjects, attack);
    this.physics.add.overlap(this.eggPhaserObjects, this.antPhaserObjects, attack);
    this.physics.add.overlap(this.sugarPhaserObjects, this.antPhaserObjects, attack);



}

function attack(deffendPhaser, attackPhaser) {

    // console.log(attackPhaser);
    let attackObj = everyObject[attackPhaser.id];
    let deffendObj = everyObject[deffendPhaser.id];
    //todo figure out
    if (typeof attackObj !== 'undefined' && typeof deffendObj !== 'undefined') {
        if (deffendObj.team !== attackObj.team || deffendObj.team === "undefined") {


            // console.log(deffendObj);
            deffendObj.takeDamage(attackObj.attack());
            // attackObj.getHealth();
            // attackObj.getEnergy();
            if (deffendObj.hp <= 0) {
                removeObject(deffendObj);
                if (attackObj.group === "players") {
                    attackObj.getPoints();
                }

            }
        }

    }
}

var objectIdCounter = 0;

function makeSugar() {
    var self = this;
    objectIdCounter++;
    everyObject[objectIdCounter] = new Sugar(objectIdCounter);
    const sugar = self.physics.add.image(everyObject[objectIdCounter].x, everyObject[objectIdCounter].y, 'sugar').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    sugar.id = objectIdCounter;
    self.sugarPhaserObjects.add(sugar);
    io.emit('newObj', everyObject[objectIdCounter]);
    console.log("Sugar function called " + everyObject[objectIdCounter].x);
}

function makeEgg(player) {
    // var self = this;
    console.log("makeegg was ran");
    objectIdCounter++;
    everyObject[objectIdCounter] = new Egg(objectIdCounter, everyObject[player.id].team, player.x, player.y);
    console.log(everyObject[objectIdCounter]);
    const egg = test.physics.add.image(everyObject[objectIdCounter].x, everyObject[objectIdCounter].y, 'egg').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    egg.id = objectIdCounter;
    test.eggPhaserObjects.add(egg);
    io.emit('newObj', everyObject[objectIdCounter]);
    console.log("egg function called " + everyObject[objectIdCounter].x);


    //  test.time.addEvent({ delay: 100000, callback: hatchEgg(egg), callbackScope: this, loop: false });
    test.timerTest = test.time.delayedCall(5000, hatchEgg, [egg], this);
}

function testMethod(egg) {
    console.log("test ran" + egg.x);
}

function hatchEgg(eggAsset) {
    objectIdCounter++;
    console.log("Egg hatched");
    everyObject[objectIdCounter] = new Ant(objectIdCounter, everyObject[eggAsset.id].team, eggAsset.x, eggAsset.y);
    console.log(everyObject[objectIdCounter]);
    const ant = test.physics.add.image(everyObject[objectIdCounter].x, everyObject[objectIdCounter].y, 'ant').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    ant.id = objectIdCounter;
    ant.setDrag(100);
    //ant.setBounce(1);
    test.antPhaserObjects.add(ant);
    io.emit('newObj', everyObject[objectIdCounter]);

    removeObject(everyObject[eggAsset.id]);
}

function update() {


    this.playerPhaserObjects.getChildren().forEach((player) => {
        const input = everyObject[player.id].input;

        //   console.log(players[player.id].target.x + " , " + players[player.id].target.y)

        if (player.body.speed > 0) {

            var distance = Phaser.Math.Distance.Between(player.x, player.y, everyObject[player.id].target.x, everyObject[player.id].target.y);

            //  4 is our distance tolerance, i.e. how close the source can get to the target
            //  before it is considered as being there. The faster it moves, the more tolerance is required.
            if (distance < 4) {
                // player.body.reset(target.x, target.y);
                player.setAcceleration(0);
                player.setVelocity(0);
                everyObject[player.id].moving(false);
            }
        }
        //lay egg 
        if (input.q) {
            input.q = false;
            console.log("Debug: Trying to lay egg");
            if (everyObject[player.id].layEgg()) {
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
        everyObject[player.id].x = player.x;
        everyObject[player.id].y = player.y;
        everyObject[player.id].rotation = player.rotation;
    });

    this.antPhaserObjects.getChildren().forEach((ant) => {
        everyObject[ant.id].ai.setTask(everyObject);

        var targetObj = everyObject[ant.id].ai.getTask();
        // debugger;
        if (typeof targetObj !== 'undefined') {
            // var target = new Phaser.Math.Vector2();
            // target.x = targetObj.x;
            // target.y = targetObj.y;

            var distance = Phaser.Math.Distance.Between(ant.x, ant.y, targetObj.x, targetObj.y);


            // console.log("Innerloop");
            setPhaserMoveTo(everyObject[ant.id], targetObj);
            everyObject[ant.id].x = ant.x;
            everyObject[ant.id].y = ant.y;
            everyObject[ant.id].rotation = ant.rotation;



            if (distance < 4) {
                // player.body.reset(target.x, target.y);
                ant.setAcceleration(0);
                ant.setVelocity(0);
                everyObject[ant.id].moving(false);
            }
            // debugger;
        }


    });
    this.physics.world.wrap(this.playerPhaserObjects, 5);
    //console.log(everyObject);
    io.emit('playerUpdates', everyObject);

}

function handlePlayerInput(self, id, input) {
    self.playerPhaserObjects.getChildren().forEach((player) => {
        if (id === player.id) {
            everyObject[player.id].input = input;
        }
    });
}

function setPhaserMoveTo(obj, target) {
    //  console.log("Ran: " + obj);
    let id = obj.id;
    //debugger;
    phaserContainer[obj.group].getChildren().forEach((phaserObj) => {
        if (id === phaserObj.id) {
            everyObject[phaserObj.id].target = target;
            test.physics.moveToObject(phaserObj, target, everyObject[phaserObj.id].movementSpeed);
            everyObject[phaserObj.id].moving(true);

            //debugger;
            //rotation
            var angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(phaserObj.x, phaserObj.y, everyObject[phaserObj.id].target.x, everyObject[phaserObj.id].target.y);
            phaserObj.setAngle(angle + 270 + 1);
            //  debugger;
        }
    });
}
//removes the asset and object
function removeObject(obj) {
    io.emit('destroyObject', obj);
    if (obj !== undefined) {
        phaserContainer[obj.group].getChildren().forEach((pobj) => {
            if (obj.id === pobj.id) {
                pobj.destroy();
            }
        });
        delete everyObject[obj.id];
    }
}

function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'queen').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    player.setDrag(100);
    // player.setAngularDrag(100);
    // player.setMaxVelocity(200);
    player.id = playerInfo.id;
    self.playerPhaserObjects.add(player);
}


const game = new Phaser.Game(config);
window.gameLoaded();