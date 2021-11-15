var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    backgroundColor: '#4488aa',
    scene: {
        preload: preload,
        create: create,
        update: update,

    }
};
var game = new Phaser.Game(config);

function preload() {
    // this.load.image('ship', 'assets/spaceShips_001.png');
    // this.load.image('otherPlayer', 'assets/enemyBlack5.png');
    this.load.spritesheet('players', 'assets/ant.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('sugars', 'assets/sugar.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('eggs', 'assets/egg.png', { frameWidth: 32, frameHeight: 32 });
}

var cursors;


function create() {
    var self = this;
    this.socket = io();
    this.players = this.add.group();
    this.sugars = this.add.group();
    this.eggs = this.add.group();

    this.anims.create({
        key: "move",
        frameRate: 5,
        frames: this.anims.generateFrameNumbers("players", { start: 0, end: 1 }),
        repeat: -1
    });

    this.anims.create({
        key: "pause",
        frameRate: 2,
        frames: this.anims.generateFrameNumbers("players", { start: 1, end: 1 }),
        repeat: -1
    });


    // this.socket.on('currentSugars', function(sugars) {
    //     Object.keys(sugars).forEach(function(id) {
    //         displayAsset(self, sugars[id])
    //     });
    // });

    this.socket.on('currentObjects', function(objs) {
        Object.keys(objs).forEach(function(id) {
            displayAsset(self, objs[id])
        });
    });

    this.socket.on('destroyObject', function(obj) {
        self[obj.group].getChildren().forEach(function(assetObj) {
            if (obj.id === assetObj.id) {
                assetObj.destroy();
            }
        });
    });
    // this.socket.on('currentEggs', function(eggs) {
    //     Object.keys(eggs).forEach(function(id) {
    //         displayAsset(self, eggs[id])
    //     });
    // });
    // this.socket.on('destroySugar', function(sugarId) {
    //     self.sugars.getChildren().forEach(function(sugar) {
    //         if (sugarId === sugar.id) {
    //             sugar.destroy();
    //         }
    //     });
    // });
    this.socket.on('destroyEgg', function(eggId) {
        self.eggs.getChildren().forEach(function(egg) {
            if (eggId === egg.id) {
                egg.destroy();
            }
        });
    });

    // this.socket.on('currentPlayers', function(players) {
    //     Object.keys(players).forEach(function(id) {
    //         if (players[id].id === self.socket.id) {
    //             displayAsset(self, players[id]);
    //         } else {
    //             displayAsset(self, players[id]);
    //         }
    //     });
    // });

    // this.socket.on('newPlayer', function(playerInfo) {
    //     displayAsset(self, playerInfo);
    // });
    this.socket.on('disconnectUser', function(playerId) {
        self.players.getChildren().forEach(function(player) {
            if (playerId === player.id) {
                player.destroy();
            }
        });
    });
    this.socket.on('playerUpdates', function(players) {
        Object.keys(players).forEach(function(id) {
            self.players.getChildren().forEach(function(player) {
                if (players[id].id === player.id) {
                    player.setRotation(players[id].rotation);
                    player.setPosition(players[id].x, players[id].y);
                    player.anims.play(String(players[id].animationState), true)
                        // console.log(id + " " + players[id].animationState)
                }
                // if (players[id].animationState === 'moving') {
                //     player.play('move')
                //     console.log("moving")
                // }
            });
        });
    });
    this.socket.on('newObj', function(obj) {
        displayAsset(self, obj);
        // console.log("Received new sugar")
    });
    // this.socket.on('newSugar', function(sugar) {
    //     displayAsset(self, sugar);
    //     console.log("Received new sugar")
    // });
    // this.socket.on('newEgg', function(egg) {
    //     displayAsset(self, egg);
    //     console.log("Received new sugar")
    // });

    var target = new Phaser.Math.Vector2();


    cursors = this.input.keyboard.addKeys("Q,E");
    this.qKeyPressed = false;
    this.eKeyPressed = false;
    // this.upKeyPressed = false;


    //new pointer
    var target = new Phaser.Math.Vector2();

    this.input.on('pointerdown', function(pointer) {

        target.x = pointer.x;
        target.y = pointer.y;

        // Move at 200 px/s:
        //  this.physics.moveToObject(source, target, 200);
        console.log("Debug: " + target.x + " " + target.y);
        //debug.clear().lineStyle(1, 0x00ff00);
        // debug.lineBetween(0, target.y, 800, target.y);
        // debug.lineBetween(target.x, 0, target.x, 600);
        this.socket.emit('playerTarget', target);

    }, this);


}
var distanceText;

function update() {



    const q = this.qKeyPressed;
    const e = this.eKeyPressed;
    // const up = this.upKeyPressed;
    if (cursors.Q.isDown) {
        this.qKeyPressed = true;
    } else {
        this.qKeyPressed = false;
    }
    if (cursors.E.isDown) {
        this.eKeyPressed = true;
    } else {
        this.eKeyPressed = false;
    }

    if (q !== this.qKeyPressed || e !== this.eKeyPressed) {
        this.socket.emit('playerInput', { q: this.qKeyPressed, e: this.eKeyPressed });
    }
    //     this.leftKeyPressed = true;
    // } else if (cursors.D.isDown) {
    //     this.rightKeyPressed = true;
    // } else {
    //     this.leftKeyPressed = false;
    //     this.rightKeyPressed = false;
    //     //test
    // }
    // if (cursors.W.isDown) {
    //     this.upKeyPressed = true;
    //     console.log("up");
    // } else {
    //     this.upKeyPressed = false;
    // }
    // if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed) {

    //     this.socket.emit('playerInput', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed });
    // }
}

// function displaySugar(self, sugar) {
//     const sugarSprite = self.add.sprite(sugar.x, sugar.y, "sugar").setOrigin(0.5, 0.5).setDisplaySize(32, 32);

//     sugarSprite.sugarId = sugar.id;
//     self.sugars.add(sugarSprite);

// }

// function displayEgg(self, egg) {
//     const eggSprite = self.add.sprite(egg.x, egg.y, "egg").setOrigin(0.5, 0.5).setDisplaySize(32, 32);
//     if (egg.team === 'blue') eggSprite.setTint(0x0000ff);
//     else eggSprite.setTint(0xff0000);
//     eggSprite.eggId = egg.id;
//     self.eggs.add(eggSprite);

// }

// function displayPlayers(self, playerInfo, sprite) {
//     const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(32, 32);
//     if (playerInfo.team === 'blue') player.setTint(0x0000ff);
//     else player.setTint(0xff0000);
//     player.playerId = playerInfo.playerId;
//     player.setDepth(2);
//     self.players.add(player);

// }

//generic display function
function displayAsset(self, assetInfoObject) {
    const asset = self.add.sprite(assetInfoObject.x, assetInfoObject.y, assetInfoObject.group).setOrigin(0.5, 0.5).setDisplaySize(32, 32);
    if (assetInfoObject.team === 'blue') asset.setTint(0x0000ff);
    else if (assetInfoObject.team === 'red') asset.setTint(0xff0000);
    asset.id = assetInfoObject.id;


    asset.setDepth(assetInfoObject.depth);

    //   self.players.add(player); same thing
    self[assetInfoObject.group].add(asset);

}