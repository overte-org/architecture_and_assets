(function () {
    var myID;

    this.preload = function (entityID) {
        print("preload");
        myID = entityID;              
    };    

    function click() {
        Entities.callEntityServerMethod(                             
            myID, 
            "doorclicked",
            [MyAvatar.sessionUUID]
        );   
       
    }

    this.startNearTrigger = click;
    this.startFarTrigger = click;
    this.clickDownOnEntity = click;
});