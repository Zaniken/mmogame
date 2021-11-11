class Sugar {
    constructor(id) {
        this.x = Math.floor(Math.random() * 700) + 50;
        this.y = Math.floor(Math.random() * 500) + 50;
        this.id = id;
        this.hp = 20;

    }
    takeDamage() {
        this.hp -= 10;
        console.log("damage taken");
    }
}