var reset = false;
var RESET_TIME = 20;
var SEARCH_RADIUS = 10000;
var LOCATION_ROOT_URL = Script.resolvePath(".");   
var PICK_FILTERS = Picks.PICK_ENTITIES | Picks.PICK_AVATARS | Picks.PICK_PRECISE;
var isCreated = false;
var isHovering = false;
var intersectionPosition;
var intersectionNormal;
var isBaseXpos = true;
var isBaseYpos = false;
var isBaseZpos = false;
var LOADING_CHECK_TIME_MS = 100;
var MAIN_INTERVAL_MS = 20;
var ROTATION_STEP = 5;
var MINIMUM_SCALE = 0.01;
var SCALE_FACTOR = 1.1;
var isBlocksLoaded = false;
var unitModelID;
var selectorID = Uuid.NULL;
var unitModelUrl;
var natDim;
var newRotation = Quat.IDENTITY;
var incrementRotation = Quat.IDENTITY;
var rotateIncrement;
var incrementVector;
var baseDirection = 2;
var baseVector = Vec3.UNIT_Y;
var objectPos;
var isCaptured = false;
var isRunning = false;
var scale = 1;
var allNewItems = [];
var items = [];
var allModels = [];
var ITEM_LIBRARY_URL = "https://bas-skyspace.ams3.digitaloceanspaces.com/ItemPlacer/plants.json";
var libCounter = 0;
var isUpRight = false;

function checkIfAllModelsAreLoaded(checkItems) {    
    var timer = Script.setInterval(function () {
        var counter = 0;
        for (var i in checkItems) {
            if (Entities.isLoaded(checkItems[i])) {                
                counter++;                
            }
            if (counter === checkItems.length) {
                isBlocksLoaded = true;
                Script.clearInterval(timer);
                print("models Loaded");                
                print(allModels[0]);
                natDim = Entities.getEntityProperties(allModels[0],"naturalDimensions").naturalDimensions;
                unitModelUrl = Entities.getEntityProperties(allModels[0],"modelURL").modelURL;                 
                selectorID = Entities.addEntity( {
                    type: "Model",
                    modelURL: unitModelUrl,
                    useOriginalPivot: false,                   
                    collisionless: true,
                    ignorePickIntersection: true,
                    dimensions: natDim,
                    visible: true,
                    name: "Unit",            
                    position: objectPos,
                    rotation: rotateIncrement,                
                    lifetime: 3600,                
                    userData: "{ \"grabbableKey\": { \"grabbable\": false, \"triggerable\": false } }"
                });
                isCreated = true;
            }
        }
    }, LOADING_CHECK_TIME_MS);

    
}

function loadModels(url) { 
    items = [];
    allModels = [];   
    items = Script.require(url + "?" + Date.now());    
    for (var i = 0; i < items.models.length; i++) {        
        var itemID = Entities.addEntity({ 
            parentID: MyAvatar.sessionUUID,        
            type: "Model",
            modelURL: items.models[i] + "?" + Date.now(),
            collisionless: true,
            visible: true,
            ignorePickIntersection: true,
            name: "ItemLib" + i,
            description: "", 
            // position: MyAvatar.position,          
            lifetime: 100,
            dimensions: {
                x: 0.05,
                y: 0.05,
                z: 0.05},
            userData: "{ \"grabbableKey\": { \"grabbable\": false, \"triggerable\": false } }"
        },"local");
        allModels.push(itemID);
    }
    checkIfAllModelsAreLoaded(allModels);
}

function changeSelector(count) {
    var newSelector = allModels[count];
    natDim = Entities.getEntityProperties(newSelector,"naturalDimensions").naturalDimensions;
    unitModelUrl = Entities.getEntityProperties(newSelector,"modelURL").modelURL;
    Entities.editEntity (selectorID,{
        modelURL: unitModelUrl,
        rotation: rotateIncrement,
        position: objectPos,
        dimensions: {x: natDim.x*scale, y: natDim.y*scale, z: natDim.z*scale }
    });
}

function captureKeys() {    
    Controller.captureKeyEvents({key: 0x2d, isKeypad: true}); // minus
    Controller.captureKeyEvents({key: 0x2a, isKeypad: true}); // star   
    Controller.captureKeyEvents({key: 0x34, isKeypad: true}); // 4
    Controller.captureKeyEvents({key: 0x35, isKeypad: true}); // 5
    Controller.captureKeyEvents({key: 0x36, isKeypad: true}); // 6
    Controller.captureKeyEvents({key: 0x2e, isKeypad: true}); // .
    Controller.captureKeyEvents({key: 0x37, isKeypad: true}); // 7
    Controller.captureKeyEvents({key: 0x39, isKeypad: true}); // 9
    Controller.captureKeyEvents({key: 0x30, isKeypad: true}); // 1
    Controller.captureKeyEvents({key: 0x31, isKeypad: true}); // 2
    Controller.captureKeyEvents({key: 0x32, isKeypad: true}); // 3    
}

function releaseKeys() {   
    Controller.releaseKeyEvents({key: 0x2d, isKeypad: true}); // minus
    Controller.releaseKeyEvents({key: 0x2a, isKeypad: true}); // star    
    Controller.releaseKeyEvents({key: 0x34, isKeypad: true}); // 4
    Controller.releaseKeyEvents({key: 0x34, isKeypad: true}); // 5
    Controller.releaseKeyEvents({key: 0x36, isKeypad: true}); // 6
    Controller.releaseKeyEvents({key: 0x2e, isKeypad: true}); // .
    Controller.releaseKeyEvents({key: 0x37, isKeypad: true}); // 7
    Controller.releaseKeyEvents({key: 0x39, isKeypad: true}); // 9
    Controller.releaseKeyEvents({key: 0x30, isKeypad: true}); // 1
    Controller.releaseKeyEvents({key: 0x31, isKeypad: true}); // 2
    Controller.releaseKeyEvents({key: 0x32, isKeypad: true}); // 3    
}

// events
function keyPressEvent(event) {    
    if (event.text.toUpperCase() === "F1") {
        isRunning = !isRunning;       
        if (!isRunning) {
            releaseKeys();            
            Entities.editEntity(selectorID,{visible: false});
        } else {
            Entities.editEntity(selectorID,{visible: true});
            captureKeys();
        }
    }
    if (event.text.toUpperCase() === "F2") {
        for (var i in allModels) {
            Entities.deleteEntity(allModels[i]);
        } 
        Entities.deleteEntity(selectorID);
        allModels = [];
        isCreated = false;
        var url = Window.prompt("URL of the library","");
        loadModels(url);
        print("loading models......");     
    }
    if (isBlocksLoaded === true && isRunning === true) {          
        switch (event.text.toUpperCase()) {
            case "7":
                libCounter++;                
                if (libCounter >= allModels.length) {
                    libCounter = 0;
                }                
                changeSelector(libCounter);
                break;  
            case "9":              
                libCounter--;                  
                if (libCounter < 0) {
                    libCounter = allModels.length-1;
                }
                changeSelector(libCounter);              
                break;        
            case "4":
                incrementVector = Vec3.multiply(baseVector,-ROTATION_STEP);  
                incrementRotation = Quat.multiply(
                    incrementRotation,
                    Quat.fromPitchYawRollDegrees(incrementVector.x,incrementVector.y,incrementVector.z));               
                break;
            case "6":               
                incrementVector = Vec3.multiply(baseVector,ROTATION_STEP);  
                incrementRotation = Quat.multiply(
                    incrementRotation,
                    Quat.fromPitchYawRollDegrees(incrementVector.x,incrementVector.y,incrementVector.z));
                break;
            case "*":
                scale = scale * SCALE_FACTOR;                                
                break;
            case "-":              
                scale = scale * (1 / SCALE_FACTOR);
                if (scale < MINIMUM_SCALE) {
                    scale = MINIMUM_SCALE;
                }
                break;            
            case "1":              
                incrementRotation = Quat.IDENTITY;
                if (isBaseXpos) { 
                    baseDirection = 0;               
                    baseVector = Vec3.UNIT_X;                                        
                } else {
                    baseDirection = 1; 
                    baseVector = Vec3.UNIT_NEG_X;    
                }
                isBaseXpos = !isBaseXpos;
                break;
            case "2":               
                incrementRotation = Quat.IDENTITY;
                if (isBaseYpos) { 
                    baseDirection = 2;                
                    baseVector = Vec3.UNIT_Y;
                } else {
                    baseDirection = 3; 
                    baseVector = Vec3.UNIT_NEG_Y;   
                }
                isBaseYpos = !isBaseYpos;
                break;
            case "3":
                incrementRotation = Quat.IDENTITY;               
                if (isBaseZpos) {
                    baseDirection = 4;                 
                    baseVector = Vec3.UNIT_Z;
                } else {
                    baseDirection = 5; 
                    baseVector = Vec3.UNIT_NEG_Z;   
                }
                isBaseZpos = !isBaseZpos;
                break;
            case ".":
                incrementRotation = Quat.IDENTITY;               
                natDim = Entities.getEntityProperties(selectorID,"naturalDimensions").naturalDimensions;
                Entities.editEntity(selectorID,{dimensions: natDim});
                scale = 1;         
                break;
            case "5":
                isUpRight = !isUpRight;
                break;                                                               
        }
    }
}

function hoverEvent(id,event) {    
    if (isBlocksLoaded === true && isRunning === true) {        
        if (selectorID !== Uuid.NULL) {
            if (isUpRight) {
                intersectionNormal = Quat.IDENTITY;
            } else {               
                intersectionNormal = event.normal;            
            }
            intersectionPosition = event.pos3D;
        }
    }
}

function onMousePressEvent(id,event) {    
    if (isBlocksLoaded === true && isRunning === true) {    
        if (event.button === "Primary" && reset) {
            natDim = Entities.getEntityProperties(selectorID,"naturalDimensions").naturalDimensions;
            unitModelUrl = Entities.getEntityProperties(selectorID,"modelURL").modelURL;           
            if (!HMD.showTablet) {
                var newItem = Entities.addEntity( {
                    type: "Model",
                    modelURL: unitModelUrl,
                    shapeType: "static-mesh",
                    useOriginalPivot: false,                   
                    collisionless: false,
                    ignorePickIntersection: false,
                    visible: true,
                    name: "Item",            
                    position: objectPos,
                    rotation: rotateIncrement,                    
                    dimensions: {x: natDim.x*scale, y: natDim.y*scale, z: natDim.z*scale },                
                    lifetime: -1,                
                    userData: "{ \"grabbableKey\": { \"grabbable\": false, \"triggerable\": false } }"
                });                
                allNewItems.push(newItem);
            }
        }
        if (event.button === "Secondary") {            
            if (allNewItems.indexOf(id) !== -1) {
                Entities.deleteEntity(id);
                print("deleting");
            }
        }        
        isCaptured = false;  
    }
}

// debounce loop
Script.setInterval(function () {
    reset = true;    
}, RESET_TIME);

// main update loop
var mainTimer = Script.setInterval(function () {   
    var test = Entities.getEntityProperties(selectorID,"modelURL").modelURL;    
        
    if (isBlocksLoaded === true && isRunning === true) {         
        var rotateBaseToNormal = Quat.rotationBetween(baseVector,intersectionNormal);        
        rotateIncrement = Quat.multiply(rotateBaseToNormal,incrementRotation);       
        if (baseDirection === 0) {            
            objectPos = Vec3.sum(intersectionPosition,Vec3.multiplyQbyV(rotateBaseToNormal, { x: (natDim.x/2)*scale, y: 0, z: 0}));
        }
        if (baseDirection === 1) {            
            objectPos = Vec3.sum(intersectionPosition,Vec3.multiply(-1,Vec3.multiplyQbyV(rotateBaseToNormal, { x: (natDim.x/2)*scale, y: 0, z: 0})));
        }
        if (baseDirection === 2) {            
            objectPos = Vec3.sum(intersectionPosition,Vec3.multiplyQbyV(rotateBaseToNormal, { x: 0, y: (natDim.y/2)*scale, z: 0}));
        }
        if (baseDirection === 3) {            
            objectPos = Vec3.sum(intersectionPosition,Vec3.multiply(-1,Vec3.multiplyQbyV(rotateBaseToNormal, { x: 0, y: (natDim.y/2)*scale, z: 0})));
        }
        if (baseDirection === 4) {            
            objectPos = Vec3.sum(intersectionPosition,Vec3.multiplyQbyV(rotateBaseToNormal, { x: 0, y: 0, z: (natDim.z/2)*scale }));
        }
        if (baseDirection === 5) {            
            objectPos = Vec3.sum(intersectionPosition,Vec3.multiply(-1,Vec3.multiplyQbyV(rotateBaseToNormal, { x: 0, y: 0, z: (natDim.z/2)*scale})));
        }
        Entities.editEntity (selectorID,{
            rotation: rotateIncrement,
            position: objectPos,
            dimensions: {x: natDim.x*scale, y: natDim.y*scale, z: natDim.z*scale }
        });
               
    }
}, MAIN_INTERVAL_MS);

// script ends cleanup
Script.scriptEnding.connect(function () {  
    Entities.hoverOverEntity.disconnect(hoverEvent);
    Controller.keyPressEvent.disconnect(keyPressEvent);    
    Entities.mousePressOnEntity.disconnect(onMousePressEvent);     
    Script.clearInterval(mainTimer);  
    for (var i in allModels) {
        Entities.deleteEntity(allModels[i]);
    } 
    Entities.deleteEntity(selectorID);
    releaseKeys();
});

// start program
loadModels(ITEM_LIBRARY_URL);
Entities.hoverOverEntity.connect(hoverEvent);
Controller.keyPressEvent.connect(keyPressEvent);
Entities.mousePressOnEntity.connect(onMousePressEvent);