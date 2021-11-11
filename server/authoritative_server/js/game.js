const players = {};
const sugars = {};

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
    this.players = this.physics.add.group();
    io.on('connection', function(socket) {
        console.log('a user connected');
        // create a new player and add it to our players object
        players[socket.id] = new Queen(socket.id);
        // add player to server
        addPlayer(self, players[socket.id]);
        // send the players object to the new player
        socket.emit('currentPlayers', players);
        socket.emit("currentSugars", sugars);
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
        socket.on('disconnect', function() {
            console.log('user disconnected');
            // remove player from server
            removePlayer(self, socket.id);
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnectUser', socket.id);
        });
        // when a player moves, update the player data
        socket.on('playerInput', function(inputData) {
            handlePlayerInput(self, socket.id, inputData);
            console.log("E pressed: " + inputData.e + " Q pressed: " + inputData.q);
        });

        //target input
        socket.on('playerTarget', function(target) {
            //  console.log("Socket read click")
            handlePlayerInput2(self, socket.id, target);

        });
    });

    // sugar timer stuff 
    this.sugars = this.physics.add.group();
    //this.monsterTimer = game.time.events.loop(Phaser.Timer.SECOND, this.addMonster, this);
    this.timedEventSugar = this.time.addEvent({ delay: 10000, callback: makeSugar, callbackScope: this, loop: true });

    //collision stuff
    this.physics.add.overlap(this.sugars, this.players, antSugar);
}


//ant attacking sugar
function antSugar(sugar, ant) {
    // console.log(players[ant.playerId].input.e);
    if (players[ant.playerId].input.e) {
        players[ant.playerId].input.e = false;
        console.log("attcking sugar");
        sugars[sugar.id].takeDamage();
        players[ant.playerId].getEnergy();
        if (sugars[sugar.id].hp <= 0) {

            io.emit('destroySugar', sugar.id);
            sugar.destroy();

            delete sugars[sugar.id];
        }
    }
}
var sugarID = 0;

function makeSugar() {
    var self = this;
    sugarID++;
    sugars[sugarID] = new Sugar(sugarID);
    const sugar = self.physics.add.image(sugars[sugarID].x, sugars[sugarID].y, 'sugar').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    sugar.id = sugarID;
    self.sugars.add(sugar);
    io.emit('newSugar', sugars[sugarID]);
    console.log("Sugar function called " + sugars[sugarID].x);
}

function makeEgg() {

}


function update() {
    this.players.getChildren().forEach((player) => {
        const input = players[player.playerId].input;

        //   console.log(players[player.playerId].target.x + " , " + players[player.playerId].target.y)

        if (player.body.speed > 0) {

            var distance = Phaser.Math.Distance.Between(player.x, player.y, players[player.playerId].target.x, players[player.playerId].target.y);

            //  4 is our distance tolerance, i.e. how close the source can get to the target
            //  before it is considered as being there. The faster it moves, the more tolerance is required.
            if (distance < 4) {
                // player.body.reset(target.x, target.y);
                player.setAcceleration(0);
                player.setVelocity(0);
                players[player.playerId].moving(false);
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
        //     players[player.playerId].moving(true);
        // } else {
        //     players[player.playerId].moving(false);
        //     player.setAcceleration(0);
        //     player.setVelocity(0);

        // }
        players[player.playerId].x = player.x;
        players[player.playerId].y = player.y;
        players[player.playerId].rotation = player.rotation;
    });
    this.physics.world.wrap(this.players, 5);
    //var objects = { players, sugars };
    io.emit('playerUpdates', players);

}

function handlePlayerInput(self, playerId, input) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            players[player.playerId].input = input;
        }
    });
}

function handlePlayerInput2(self, playerId, target) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            players[player.playerId].target = target;
            self.physics.moveToObject(player, target, 200);
            players[player.playerId].moving(true);


            //rotation
            var angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(player.x, player.y, players[player.playerId].target.x, players[player.playerId].target.y);
            player.setAngle(angle + 270 + 1);

        }
    });



}



function addPlayer(self, playerInfo) {
    const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'queen').setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    player.setDrag(100);
    // player.setAngularDrag(100);
    // player.setMaxVelocity(200);
    player.playerId = playerInfo.playerId;
    self.players.add(player);
}

function removePlayer(self, playerId) {
    self.players.getChildren().forEach((player) => {
        if (playerId === player.playerId) {
            player.destroy();
        }
    });
}
const game = new Phaser.Game(config);
window.gameLoaded();
const game = new Phaser.Game(config);
window.gameLoaded();