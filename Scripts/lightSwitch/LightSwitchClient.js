(function() {
    var myID;    
    var rotation;
    var isON = false;      
    var index = -1; 
    this.remotelyCallable = [
        "setClickState"                  
    ];

    this.preload = function (entityID) {
        myID = entityID;       
        Script.setTimeout(function () {
            // Joint data aren't available until after the model has loaded.
            index = Entities.getJointIndex(entityID, "SwitchBone");            
        }, 2000);     
    };

    this.setClickState = function (id,param) {
        isON = (param[0] === 'true');       
        if (isON) {                
            rotation = Quat.fromPitchYawRollDegrees(-90, -5, -90);                
            Entities.setLocalJointRotation(myID, index, rotation);            
        } else {
            rotation = Quat.fromPitchYawRollDegrees(-90, 5, -90);
            Entities.setLocalJointRotation(myID, index, rotation);
        }                
    };

    function onMousePressEvent(id,event) {                     
        if (event.button === "Primary" && id === myID) {

            Entities.callEntityServerMethod(                             
                myID, 
                "switchLight",
                [MyAvatar.sessionUUID, "click"]
            );
        }             
    }    
   
    Entities.mousePressOnEntity.connect(onMousePressEvent);
});
