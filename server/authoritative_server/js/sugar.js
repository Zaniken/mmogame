class Sugar extends GenericObj {
    constructor(id) {
            let x = Math.floor(Math.random() * 700) + 50;
            let y = Math.floor(Math.random() * 500) + 50;


            super(id, true, "sugars", 1, "na", 20, x, y);

        }
        // takeDamage(amount) {
        //     this.hp -= amount;
        //     console.log("damage taken");
        // }
}