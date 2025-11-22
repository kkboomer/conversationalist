const asrModule = require('LensStudio:AsrModule');

// @input Component.Text transcriptText

function onTranscriptionError(errorCode) {
  print(`onTranscriptionErrorCallback errorCode: ${errorCode}`);
  switch (errorCode) {
    case AsrModule.AsrStatusCode.InternalError:
      print('stopTranscribing: Internal Error');
      break;
    case AsrModule.AsrStatusCode.Unauthenticated:
      print('stopTranscribing: Unauthenticated');
      break;
    case AsrModule.AsrStatusCode.NoInternet:
      print('stopTranscribing: No Internet');
      break;
  }
}

function onTranscriptionUpdate(eventArgs) {
    const text = eventArgs.text;
    const isFinal = eventArgs.isFinal;

    print(`ASR Update: ${text}, Final: ${isFinal}`);

    // Display text in field of view
    if (script.transcriptText) {
        // Option 1: Replace text each time
        script.transcriptText.text = text;

        // Option 2 (optional): Append final lines for a running caption log
        // if (isFinal) {
        //     script.transcriptText.text += "\n" + text;
        // }
    }
}

function startSession() {
  var options = AsrModule.AsrTranscriptionOptions.create();
  options.silenceUntilTerminationMs = 1000;
  options.mode = AsrModule.AsrMode.HighAccuracy;
  options.onTranscriptionUpdateEvent.add(onTranscriptionUpdate);
  options.onTranscriptionErrorEvent.add(onTranscriptionError);

  // Start session
  asrModule.startTranscribing(options);
}

function stopSession() {
  asrModule.stopTranscribing().then(function () {
    print(`stopTranscribing successfully`);
  });
}

startSession();