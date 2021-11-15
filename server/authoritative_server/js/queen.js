class Queen extends GenericObj {
    constructor(playerID) {

        let x = Math.floor(Math.random() * 700) + 50;
        let y = Math.floor(Math.random() * 500) + 50;
        let team = (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue';

        super(playerID, false, "players", 3, team, 100, x, y);
        //  this.playerId = playerID;
        // this.hp = 100;
        this.rotation = 0;
        this.energy = 0;
        this.animationState = "pause";
        this.target = new Phaser.Math.Vector2();
        this.input = {
            //lay egg
            q: false,
            //attack
            e: false
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

    getHealth() {
        this.health += 5;
    }
    layEgg() {
        console.log(this.energy);
        if (this.energy >= 20) {
            this.energy -= 20;
            return true;

        } else {
            return false;
        }
    }
}