// FaceTextController.js
// Version: 0.1.0
// Event: On Awake
// Description: Provides interfaces to add and configure texts on the face


/*
@typedef texts
@property {string} text {"hint":"Type your text here"}
@property {int} faceIndex = 0
@property {string} font {"widget":"combobox", "values":[{"label":"Karla", "value":"0"}, {"label":"Montserrat", "value":"1"}, {"label":"Babas Neue", "value":"2"}, {"label":"Source Code Pro", "value":"3"}, {"label":"Vina Sans", "value":"4"}, {"label":"Dancing Script", "value":"5"}, {"label":"Lobster", "value":"6"}, {"label":"Mogra", "value":"7"}, {"label":"Teko", "value":"8"}, {"label":"Righteous", "value":"9"}, {"label":"Shadows Into Light", "value":"10"}, {"label":"Cormorant Garamond", "value":"11"}, {"label":"Indie Flower", "value":"12"}, {"label":"Sigmar", "value":"13"}, {"label":"Ysabeau", "value":"14"}, {"label":"Lilita One", "value":"15"}, {"label":"Bruno Ace", "value":"16"}, {"label":"Titan One", "value":"17"}, {"label":"Cute Font", "value":"18"}, {"label":"Source Serif Pro", "value":"19"}]}
@property {Asset.Font} customFontIfAny

@property {bool} textBackground
@property {vec4} textColor = {1,1,1,1} {"widget":"color"}
@property {vec4} backgroundColor = {1,1,1,1} {"widget":"color"}

@property {vec4} shadowColor = {1,1,1,1} {"widget":"color"}
@property {vec2} shadowOffset = {0,0}

@property {vec4} textOutlineColor = {1,1,1,1} {"widget":"color"}
@property {float} textOutlineSize

@property {vec4} layoutRect = {2,2,2,2}
@property {vec4} margin = {2,2,2,2}
@property {float} cornerRadius = 0.2 {"widget":"slider", "min":0.0, "max":1.0, "step":0.1}

@property {vec3} position
@property {int} rotation = 0 {"widget":"slider", "min":-180, "max":180, "step":10}
@property {float} scale = 2.0 {"widget":"slider", "min":1.0, "max":10.0, "step":0.1}
*/


// @input texts[] faceTexts
var faceTexts = script.faceTexts;

//@ui {"widget":"separator"}
//@input bool advanced

//@ui {"widget":"group_start", "label":"References [DO_NOT_EDIT]", "showIf":"advanced"}

//@input SceneObject positionReference
var positionReference = script.positionReference;

//@input Asset.Font[] fonts;
var fonts = script.fonts;

//@ui {"widget":"group_end"}

function initialize() {
    if (validateInputs()) {
        setText();
    }
}

var textObjects = [];


function setText() {
    for (var i = 0; i < faceTexts.length; i++) {
        var textContent = faceTexts[i].text;

        // Only create if it doesn't exist yet
        var newTextObject;
        var newText;
        if (textObjects[i]) {
            newTextObject = textObjects[i];
            newText = newTextObject.getComponent("Component.Text");
        } else {
            // Create new text object and store it
            newTextObject = global.scene.createSceneObject("Text Object " + i);
            textObjects[i] = newTextObject;

            var newReference = positionReference.getParent().copySceneObject(positionReference);
            newTextObject.setParent(newReference);
            newTextObject.layer = newReference.layer;

            var bindingComponent = newReference.getComponent("Component.Head");
            bindingComponent.faceIndex = faceTexts[i].faceIndex;

            var lookAt = newTextObject.createComponent("Component.LookAtComponent");
            lookAt.target = script.getSceneObject().getParent();
            lookAt.lookAtMode = LookAtComponent.LookAtMode.LookAtDirection;
            lookAt.aimVectors = LookAtComponent.AimVectors.ZAimYUp;
            lookAt.worldUpVector = LookAtComponent.WorldUpVector.ObjectY;

            newText = newTextObject.createComponent("Component.Text");
        }

        
        newText.text = textContent;
        newText.textFill.color = faceTexts[i].textColor;

        newText.outlineSettings.enabled = true;
        newText.outlineSettings.size = faceTexts[i].textOutlineSize;
        newText.outlineSettings.fill.color = faceTexts[i].textOutlineColor;

        newText.backgroundSettings.enabled = faceTexts[i].textBackground;
        if (faceTexts[i].textBackground) {
            newText.backgroundSettings.fill.color = faceTexts[i].backgroundColor;
        }

        var layout = Rect.create(faceTexts[i].layoutRect.x, faceTexts[i].layoutRect.y, faceTexts[i].layoutRect.z, faceTexts[i].layoutRect.w);
        newText.worldSpaceRect = layout;

        var margin = Rect.create(faceTexts[i].margin.x, faceTexts[i].margin.y, faceTexts[i].margin.z, faceTexts[i].margin.w);
        newText.backgroundSettings.margins = margin;
        newText.backgroundSettings.cornerRadius = faceTexts[i].cornerRadius;

        newText.dropshadowSettings.enabled = true;
        newText.dropshadowSettings.fill.color = faceTexts[i].shadowColor;
        newText.dropshadowSettings.offset = faceTexts[i].shadowOffset;

        newText.horizontalOverflow = HorizontalOverflow.Wrap;

        if (faceTexts[i].customFontIfAny) {
            newText.font = faceTexts[i].customFontIfAny;
        } else {
            var fontIndex = faceTexts[i].font;
            newText.font = fonts[fontIndex];
        }

        var oldPosition = newTextObject.getTransform().getWorldPosition();
        var newPosition = new vec3(
            oldPosition.x + faceTexts[i].position.x,
            oldPosition.y + faceTexts[i].position.y,
            oldPosition.z + faceTexts[i].position.z
        );
        newTextObject.getTransform().setWorldPosition(newPosition);

        var degrees = faceTexts[i].rotation;
        var radians = degrees * (Math.PI / 180);
        var axis = vec3.forward();
        var rotationToApply = quat.angleAxis(radians, axis);
        var oldRotation = newTextObject.getTransform().getWorldRotation();
        var newRotation = rotationToApply.multiply(oldRotation);
        newTextObject.getTransform().setWorldRotation(newRotation);

        var newScale = new vec3(faceTexts[i].scale, faceTexts[i].scale, faceTexts[i].scale);
        newTextObject.getTransform().setWorldScale(newScale);
    }
}



/**function setText() {
    for (var i = 0; i < faceTexts.length; i++) {
        var textContent = faceTexts[i].text;
        
        // Create a new scene object for each new text
        var newTextObject = global.scene.createSceneObject("Text Object " + i);
        
        // Create a copy of the head binding object
        var newReference = positionReference.getParent().copySceneObject(positionReference);
        newTextObject.setParent(newReference);
        newTextObject.layer = newReference.layer;
        var bindingComponent = newReference.getComponent("Component.Head"); // Get the binding component
        bindingComponent.faceIndex = faceTexts[i].faceIndex; // Set index of the face to attach the sticker 
        
        // Create a lookAt component on the scene object
        var lookAt = newTextObject.createComponent("Component.LookAtComponent");
        lookAt.target = script.getSceneObject().getParent();
        lookAt.lookAtMode = LookAtComponent.LookAtMode.LookAtDirection;
        lookAt.aimVectors = LookAtComponent.AimVectors.ZAimYUp;
        lookAt.worldUpVector = LookAtComponent.WorldUpVector.ObjectY;
        
        // Create a text component on the scene object and add the input text to it
        var newText = newTextObject.createComponent("Component.Text");
        newText.text = textContent;
        
        // Set the text style
        newText.textFill.color = faceTexts[i].textColor;
        
        newText.outlineSettings.enabled = true;
        newText.outlineSettings.size = faceTexts[i].textOutlineSize;
        newText.outlineSettings.fill.color = faceTexts[i].textOutlineColor;

        if (!faceTexts[i].textBackground) {
            newText.backgroundSettings.enabled = false;
        } else {
            newText.backgroundSettings.enabled = true;
            newText.backgroundSettings.fill.color = faceTexts[i].backgroundColor;
        }   
        
        var layout = Rect.create(faceTexts[i].layoutRect.x, faceTexts[i].layoutRect.y, faceTexts[i].layoutRect.z, faceTexts[i].layoutRect.w);
        newText.worldSpaceRect = layout;
        
        var margin = Rect.create(faceTexts[i].margin.x, faceTexts[i].margin.y, faceTexts[i].margin.z, faceTexts[i].margin.w);
        newText.backgroundSettings.margins = margin;
        newText.backgroundSettings.cornerRadius = faceTexts[i].cornerRadius;
        newText.dropshadowSettings.enabled = true;
        newText.dropshadowSettings.fill.color = faceTexts[i].shadowColor;
        newText.dropshadowSettings.offset = faceTexts[i].shadowOffset;
        newText.horizontalOverflow = HorizontalOverflow.Wrap;
        
        // Set the font
        if (faceTexts[i].customFontIfAny) {
            newText.font = faceTexts[i].customFontIfAny;
        } else {
            var fontIndex = faceTexts[i].font;
            newText.font = fonts[fontIndex];
        }   
        
        // Set the position of the text object
        var oldPosition = newTextObject.getTransform().getWorldPosition();
        var newPositionX = oldPosition.x + faceTexts[i].position.x;
        var newPositionY = oldPosition.y + faceTexts[i].position.y;
        var newPositionZ = oldPosition.z + faceTexts[i].position.z;
        var newPosition = new vec3(newPositionX, newPositionY, newPositionZ);
        newTextObject.getTransform().setWorldPosition(newPosition);
        
        // Set the rotation of the text object
        var degrees = faceTexts[i].rotation;
        var radians = degrees * (Math.PI / 180);
        var axis = vec3.forward();
        var rotationToApply = quat.angleAxis(radians, axis);
        var oldRotation = newTextObject.getTransform().getWorldRotation();
        var newRotation = rotationToApply.multiply(oldRotation);
        newTextObject.getTransform().setWorldRotation(newRotation);
        
        // Set the scale of the text object
        var newScale = new vec3(faceTexts[i].scale,faceTexts[i].scale,faceTexts[i].scale);
        newTextObject.getTransform().setWorldScale(newScale);
    }
}*/

function validateInputs() {
    if (!positionReference) {
        print("ERROR: Please make sure face reference object exist and assign the face reference object to the script");
        return false;
    }
    
    if (fonts.length != 20) {
        print("ERROR: Please make sure the number of font assets match the number of font options available in the dropdown menu");
        return false;
    }
    
    for (var i = 0; i < faceTexts.length; i++) {
        if (!faceTexts[i].text) {
            print("ERROR: Please make sure to add text to Group "+ i);
            return false;
        }
        if (!faceTexts[i].font) {
            print("ERROR: Please make sure to add font to Group "+ i);
            return false;
        }
    } 
    
    for (i = 0; i < fonts.length; i++) {
        if (!fonts[i]) {
            print("ERROR: Please make sure all font assets exist and assign the fonts to the script");
            return false;
        }
    }

    return true;
}

initialize();

function updateText(newText){
    faceTexts[0].text = "This person feels:\n" + newText;
    setText();
}

script.updateText = updateText;
