class Ai {

    //    static gameObjects = {};

    constructor(myId) {
            this.myId = myId;
            this.onTask = false;
            this.taskCheckCount = 0;


            this.target = { dist: 1000, vector: new Phaser.Math.Vector2() };
            //  console.log("ai obj " + myId);

        }
        // static setObjects(gameObjects) {
        //     this.gameObjects = gameObjects;
        // }

    //this sets the target obj
    setTask(gameObjects) {
        var self = this;
        //  console.log(this.taskCheckCount + "and  " + gameObjects);
        //   console.log(this.onTask + " " + gameObjects);
        this.taskCheckCount++;
        var myObj = gameObjects[this.myId];


        // var target = new Phaser.Math.Vector2();



        if (!this.onTask || this.taskCheckCount > 25) {
            self.target.dist = 1000;
            Object.keys(gameObjects).forEach(function(id) {
                // console.log(self);
                //  debugger;
                if (gameObjects[id].team != myObj.team) {
                    //calculate distance
                    var calcD = Phaser.Math.Distance.Between(myObj.x, myObj.y, gameObjects[id].x, gameObjects[id].y);
                    if (calcD < self.target.dist && calcD < 200) {
                        self.target.dist = calcD;
                        //  self.target.obj = gameObjects[id];


                        self.target.vector.x = gameObjects[id].x;
                        self.target.vector.y = gameObjects[id].y;

                        //  self.target.vector = target;    

                        //  debugger;
                    }
                }
                self.onTask = true;
                self.taskCheckCount = 0;

            });
        }
        //returning the object to be moved too.


    }

    //this returns the target obj
    getTask() {
        return this.target.vector;
    }

}