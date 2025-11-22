// -----JS CODE-----
//@input int faceLandmarkIndex = 30 {"min": 0, "max": 92}
//@input Component.Head headBinding
var isFaceTracking = false;

//Debounce Functionality:
var lastUpdateTime = 0;
var updateInterval = 1.0;

//@input Asset.InternetModule internetModule
/** @type {InternetModule} */
var internetModule = script.internetModule;

async function onUpdate() {
    var currentTime = getTime();
    
    // Only run once per second
    if (currentTime - lastUpdateTime < updateInterval) {
        return;
    }
    lastUpdateTime = currentTime;

    if (!isFaceTracking) {  
        return;
    }

    var landmarks = []

    for (let i = 0; i < 93; i++){
        var landmarkTransform = script.headBinding.getLandmark(i);
        if(landmarkTransform){
            landmarks.push({
                index: i,
                x: landmarkTransform.x,
                y: landmarkTransform.y,
            });
        }
    }
    
    var jsonData = JSON.stringify({ 
        timestamp: currentTime,
        landmarks: landmarks 
    });
    
    
    print(landmarks[0].x + ' ' + landmarks[0].y);
    
    //await sendToServer(jsonData);
}

function onFaceFound() {
  isFaceTracking = true;
}
function onFaceLost() {
  isFaceTracking = false;
}

var faceFoundEvent = script.createEvent('FaceFoundEvent');
faceFoundEvent.bind(onFaceFound);
var faceLostEvent = script.createEvent('FaceLostEvent');
faceLostEvent.bind(onFaceLost);
var updateEvent = script.createEvent('UpdateEvent');
updateEvent.bind(onUpdate);

async function sendToServer(jsonData) {
    let request = new Request('http://127.0.0.1:5000/emotion', {
        method: 'POST',
        body: jsonData,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    let response = await internetModule.fetch(request);
    if (response.status == 200) {
        let text = await response.text();
        print(text);
    }
}
