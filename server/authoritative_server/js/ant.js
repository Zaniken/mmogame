class Ant extends Queen {

    constructor(id, team, x, y) {
        super(id);
        this.x = x;
        this.y = y;
        this.team = team;
        this.group = "ants";
        this.ai = new Ai(id);
        //this.input.e = true;
        this.attackCount = 0;
        this.movementSpeed = 100;
    }
    attack() {
        this.attackCount++;
        if (this.attackCount === 15) {
            this.attackCount = 0;
            return 10;
        }
        return 0;
    }
}