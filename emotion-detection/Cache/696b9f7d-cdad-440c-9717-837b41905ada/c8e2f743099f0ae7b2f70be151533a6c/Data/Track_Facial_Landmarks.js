// -----JS CODE-----
//@input int faceLandmarkIndex = 30 {"min": 0, "max": 92}
//@input Component.Head headBinding
var isFaceTracking = false;

//Debounce Functionality:
var lastUpdateTime = 0;
var updateInterval = 1.0;


function onUpdate() {
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

function sendToServer(jsonData) {
    var request = new HttpRequest();
    request.url = "http://127.0.0.1:5000/landmarks"; // local Flask server
    request.method = "POST";
    request.setHeader("Content-Type", "application/json");
    request.body = jsonData;

    request.send(function(response) {
        if (response.status == 200) {
            print("Data sent successfully!");
        } else {
            print("Server error: " + response.status);
        }
    });
}