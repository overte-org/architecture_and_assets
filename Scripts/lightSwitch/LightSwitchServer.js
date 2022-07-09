/*
add this to the userData of the switch. Name all lights you want to control with the switch as the userData
{
    "name": "Light1"    
}
*/

(function() {
    var myID;    
    var myUserData;
    var myPosition;
    var lights = [];
    var isON = false; 
    var LOCATION_ROOT_URL = Script.resolvePath(".");
    var switchSound = SoundCache.getSound(LOCATION_ROOT_URL + "348221__tbrook__switch-light-02.mp3");
    var CLICK_VOLUME = 1;

    this.remotelyCallable = [
        "switchLight"                  
    ];

    this.preload = function (entityID) {
        myID = entityID;
    }; 

    function getLights(searchName) {
        var searchEntities = Entities.findEntities(myPosition, 10000);       
        for (var i in searchEntities) {            
            var props = Entities.getEntityProperties(searchEntities[i]);                                  
            if (props.type === "Light" && props.name === searchName) {                
                lights.push(props.id);                                 
            }            
        }
        return lights;          
    }

    this.switchLight = function(id,param) {       
        myPosition = Entities.getEntityProperties(myID,["position"]).position;
        myUserData = Entities.getEntityProperties(myID,["userData"]).userData;        
        var clickUser = param[0];            
        var data = JSON.parse(myUserData);                    
        var allLights = getLights(data.name);        
        for (var j in allLights) {
            Entities.editEntity(allLights[j],{visible: isON});
        }
        Entities.callEntityClientMethod(clickUser,              
            myID, 
            "setClickState",
            [isON]
        );
        isON = !isON;        
        Audio.playSound(switchSound, { volume: CLICK_VOLUME, position: myPosition });                            
    };    
});