var socket = io.connect( {secure: true});
var botui = new BotUI('botui-app');
var continuous = false;
var query = getQueryParams(document.location.search);

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}
window.onload = function() {
    
    /*load speech API*/
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
    var colors = [ ];
    var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.continuous = false;
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    socket.on('message', function (message) {
        botui.message.add({
            content: message.data
        }); //add to conversation UI
        responsiveVoice.speak(message.data); //say response     
        if(continuous){
            startListening();
        } //if continuous - listen again EXPERIMENTAL
    }); //on message from server

    document.body.onclick = function() {

        startListening();
    } //on page click start listening
    
    recognition.onresult = function(event) {
        var last = event.results.length - 1;
        var input = event.results[last][0].transcript;
        console.log(input);
        if(!continuous){
            if(input.toLowerCase().indexOf('Jarvis')){
                ask(input);

                recognition.stop();
                $('.title').text("J A R V I S");
            }

        }
        else{
            ask(input);

            recognition.stop();
            $('.title').text("J A R V I S");
        }


    } //once a word or phrase has been understood send message to server

    recognition.onspeechend = function() {


    } //on end of phrase or command

    recognition.onnomatch = function(event) {
        responsiveVoice.speak("Could you repeat that please?");
    } //on no match DO SOMETHING

    recognition.onerror = function(event) {
        diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
    } //on error DO SOMETHING

    function startListening(){
        $('.title').text("LISTENING");
        recognition.start();
    } //start listening

}
function ask(x){
    botui.message.add({ // show next message
        human: true,
        content: x
    });

    socket.emit('message', {data: x});
}