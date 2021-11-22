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
    takeDamage(amount) {
        this.hp -= amount;
    }

    getGenericObj() {
        return new EvenMoreGenericObj(this.id, this.x, this.y, this.group, this.depth, this.team);
    }

}
class EvenMoreGenericObj {

    constructor(id, x, y, group, depth, team) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.group = group;
        this.depth = depth;
        this.team = team;
    }

}