/*
add this to the userData
{
    "degrees": "-90",
    "time": "0.5",
    "soundOpenURL": "",
    "soundCloseURL": ""
  }
*/

(function () {    
    var myID;
    var isMoving = false;
    var doorstate = "closed";
    var SOUND_LOAD_TIME = 100;
    var SEC_TO_MS = 1000;  

    this.preload = function (entityID) {
        print("preload");
        myID = entityID;              
    };    

    this.remotelyCallable = [
        "doorclicked"             
    ];

    this.doorclicked = function(id,param) {
        print("clicking");
        if (!isMoving) {        
            switch (doorstate) {
                case "open":
                    closeDoor();               
                    break;
                case "closed":  
                    openDoor();             
                    break;            
            }
        }
    };

    function closeDoor() {
        isMoving = true;
        print("closing door");
        var props = Entities.getEntityProperties(myID);
        var userdata = JSON.parse(props.userData);
        var degrees = parseInt(userdata.degrees);       
        var time = parseFloat(userdata.time); 
        
        var soundCloseURL = userdata.soundCloseURL;
        var injectorOptions = {
            position: props.position,       
            volume: 0.3,            
            localOnly: false           
        };

        var sound = SoundCache.getSound(soundCloseURL);         
        Script.setTimeout(function () { // Give the sound time to load.
            Audio.playSound(sound, injectorOptions);            
        }, SOUND_LOAD_TIME);        

        var counter = 0;        
        var timer = Script.setInterval(function () {            
            var newRotation = Quat.fromPitchYawRollDegrees(0, counter, 0 );
            Entities.editEntity(myID,{rotation: Quat.multiply(props.rotation,newRotation)});
            if (degrees > 1) {  
                counter--;
            } else {
                counter++;
            }
        }, (time * SEC_TO_MS) / Math.abs(degrees) );        

        Script.setTimeout(function () {             
            Script.clearInterval (timer);
            isMoving = false;
            var newRotation = Quat.fromPitchYawRollDegrees(0, -degrees, 0 );
            Entities.editEntity(myID,{rotation: Quat.multiply(props.rotation,newRotation)});        
            doorstate = "closed";            
        }, time * SEC_TO_MS);        
    } 

    function openDoor() {
        isMoving = true;
        print("opening door");
        var props = Entities.getEntityProperties(myID);
        var userdata = JSON.parse(props.userData);
        var degrees = parseInt(userdata.degrees);        
        var time = parseFloat(userdata.time);
        var soundOpenURL = userdata.soundOpenURL;              
        var injectorOptions = {
            position: props.position,       
            volume: 0.3,            
            localOnly: false           
        };
        var sound = SoundCache.getSound(soundOpenURL);         
        Script.setTimeout(function () { // Give the sound time to load.
            Audio.playSound(sound, injectorOptions);            
        }, SOUND_LOAD_TIME);      
        var counter = 0;
        var timer = Script.setInterval(function () {
            // print("rotating");
              
            var newRotation = Quat.fromPitchYawRollDegrees(0, counter, 0 );
            Entities.editEntity(myID,{rotation: Quat.multiply(props.rotation,newRotation)});
            if (degrees > 1) {  
                counter++;
            } else {
                counter--;
            }                                 
        }, (time * SEC_TO_MS) / Math.abs(degrees) );        

        Script.setTimeout(function () {            
            Script.clearInterval (timer);
            isMoving = false;
            var newRotation = Quat.fromPitchYawRollDegrees(0, degrees, 0 );
            Entities.editEntity(myID,{rotation: Quat.multiply(props.rotation,newRotation)});           
            doorstate = "open"; 
        }, time * SEC_TO_MS);        
    }    
});