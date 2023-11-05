## **Voice Synthesis**

This voice activated user interface allows a user to interact with AVA and the [acai.so](http://acai.so) toolkit using voice commands. It uses speech recognition to transcribe the user's voice into text and text-to-speech (TTS) to convert the application's response into voice. The component supports multiple TTS engines including the Web Speech API, Elevenlabs, and Bark.

## **Features**

- **Voice Activation**: The component listens for the user's voice and converts it into text.
- **Text-to-Speech (TTS)**: The component supports multiple TTS engines and can convert text into voice.
- **Manual TTS**: Users can manually enter text to be converted into voice.
- **Transcription**: The component provides a transcript of the user's voice commands.
- **Single Command Mode**: In this mode, the component will stop listening after a single command is issued.
- **Voice State Options**: The component can be set to different states including idle, Ava, notes, and voice.

## **Usage**

1. **Settings:** If you want to use a text-to-speech or transcription service other than the browser based web speech api, you'll need to set these up. Check out the related section below.

2. **Transcribe**: Check the "Transcribe" checkbox to start the voice recognition. The component will start listening for your voice and transcribe it into text.

3. **User Transcript**: This is where the transcribed text from your voice commands will be displayed.

4. **Clear Transcript**: Click this button to clear the user transcript.

5. **Synthesis Mode**: Use the dropdown to select the voice recognition state. Options include 'idle', 'Ava', 'notes', and 'voice'.

6. **Single Command**: Check the "Single Command" checkbox if you want the component to stop listening after a single command.

7. **TTS Engine**: Use the dropdown to select the TTS engine. Options include 'webSpeech', 'elevenlabs', and 'bark'.

8. **Manual TTS**: Enter text into the textarea and press "Submit" or "Enter" to convert the text into voice.

9. **Audio Player**: This is where the audio response from the application will be played.

## **Modes**

**Idle** - Nothing to see here.

**AVA** - Send the transcript to the selected agent the response is added to the chat history and summarized to be sent to the selected TTS engine.

**Notes** - Transcribes for as long as the mode is Notes and then it sends the transcript to our notes chain. The notes chain does it's best to highlight the key action items from the transcript and creates a document with the items.

**Voice** - A voice to voice pipeline. Sends the transcript directly to the TTS Engine to be synthesized

## **Web Speech API and Compatibility**

The Web Speech API is a powerful tool that allows developers to incorporate speech recognition and synthesis into their web applications. However, it's important to note that support for the Web Speech API varies across different browsers and platforms.

As of now, the Web Speech API is fully supported in Google Chrome and Samsung Internet. It is partially supported in Microsoft Edge and is not supported in Firefox, Safari, and Internet Explorer.

For speech synthesis, the voices available can also vary depending on the system and browser. Some browsers may use the system's built-in voices, while others may provide their own voices.

Therefore, if you are planning to use this component in your application, it's crucial to consider your users' browser and platform. For a broader range of support, consider implementing fallback options or alternative methods for voice recognition and synthesis.

For up-to-date and detailed information about browser compatibility, please refer to the [**<u>Web Speech API Browser Compatibility</u>**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility) on MDN Web Docs.

## **Voice Recognition Modules**

### **Elevenlabs**

A really well done voice cloning service and inference service

- Setup your API key in the settings menu. Visit [elevenlabs.io](http://elevenlabs.io) for more info
- In the **Voice Recognition** dropdown use the **TTS Engine** dropdown to select **Elevenlabs** from the menu
- You'll see the voices you have available on your account in a new dropdown. The custom voices are listed first.

### **Bark**

\`Local dev mode only'

A self hosted option running off of your own GPU.

- Visit [github.com/artificialcitizens/bark-tts-api](http://github.com/artificialcitizens/bark-tts-api) and follow setup instructions there
- Go to the settings menu and add your server url to the **Bark Server** field
- In the **Voice Recognition** dropdown use the **TTS Engine** dropdown to select **Bark** from the menu
