class GenericObj {
    constructor(id, moveable, group, depth, team, hp, x, y) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.team = team;
        this.id = id;
        this.moveable = moveable;
        this.group = group;
        this.depth = depth;
    }
    takeDamage() {
        this.hp -= 10;
    }
}