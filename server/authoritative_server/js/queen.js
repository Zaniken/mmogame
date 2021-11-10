class Queen {
    constructor(playerID) {
        this.rotation = 0;
        this.x = Math.floor(Math.random() * 700) + 50;
        this.y = Math.floor(Math.random() * 500) + 50;
        this.playerId = playerID;
        this.hp = 100;
        this.energy = 0;
        this.animationState = "pause";
        this.team = (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue';
        this.target = new Phaser.Math.Vector2();
        this.input = {

            eAttack: false,
            qAttack: false
        };


    };

    moving(movement) {

        if (movement) {
            // console.log("test");
            this.animationState = "move";
        } else {
            this.animationState = "pause";
        }

    }
    takeDamage() {
        this.hp -= 10;
    }
    getEnergy() {
        this.energy += 10;
    }
    layEgg() {
        if (this.energy > 50) {
            this.energy -= 50;
            return true;

        } else {
            return false;
        }
    }
}