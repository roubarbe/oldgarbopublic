/*
    This library/app was born out of frustration. How can there be no -well-documented- way
	to talk with TN3270(E) servers. If not only to read data from them without using a big
	and clunky terminal emulator.

	Thank you, everyone.
	
	Made with love in Montreal,
	Work started during the 2020 COVID-19 Pandemic
*/

const ver = "0.0.5";

console.log("Welcome to OldGarbo, where talking with old garbo is a daily occurence");
console.log("Currently running version:", ver);

console.log("Loading Chalk");
const chalk = require('chalk');

console.log("Loading KeyPress");
const keyPress = require('keypress');
keyPress(process.stdin);

console.log("Loading Config file...");
const config = require('./config');

console.log("Loading Net");
const net = require('net');

console.log("Loading tnLib");
const tnLib = require('./tnLib');

console.log("Loading Negociator");
const Negociator = require("./classes/negociator");
let negociate = new Negociator();

console.log("Loading DataStream");
const Dstream = require('./classes/DataStream');
let dataStream = new Dstream();

let socket = new net.Socket();

console.log("Opening Socket to:\n	Host: "+chalk.blue(config.host)+"\n	Port: "+chalk.blue(config.port));

socket.connect({host:config.host,port:config.port});

socket.on('ready', () => {
	console.log("Connection opened!");
});

socket.on('error', err =>{
	console.log(err);
});

socket.on('close', () =>{
	console.log("Server said byebye");
})

socket.on('data', data => {
	// If the first received packet is "IAC" (255, FF), it means we have to pay attention (negociations)
	if(Number(data[0]) === 255){
		let answer = Buffer.from("");

		let response = negociate.answerThis(data);

		if(response.hasOwnProperty("error")){
			console.log(response.error);
			socket.end();
		}
		else{	
			if(response.hasOwnProperty("options")){
				config.options = response.options;
			}

			if(response.hasOwnProperty("dataStream")){
				config.dataStream = true;
			}

			if(response.hasOwnProperty("tn3270e")){
				config.tn3270e = true;

			}
			dataStream.setConfig(response);

			// console.log("<<", response.humanHost);
			answer = response.buffResponse;
		}

		// If the answer variable has no assigned value or type
		if(answer !== undefined){
			// answer must always be an array
			if(Buffer.isBuffer(answer)){
				socket.write(answer);
				// console.log(">>", response.humanResponse);
				// console.log(">>", answer);
			}
			else{
				console.log("answer is not a buffer");
				socket.end();
			}
		}
		else{
			console.log("answer is undefined");
			socket.end();
		}
	}
	
	// Else we're now out of negociations and into data streams
	else{
		// console.log(data);
		// If we've negociated a 3270 data stream
		if(config.dataStream){
			// tnLib.convertBuffer.from3270DataStream(data);
			// tnLib.display.printBuffer();
			// console.log("lol");
			dataStream.fromHost(data);
		}

		// Else it's just ASCII chars
		else{
			// console.log(tnLib.handshake.convertBufferToArray(data));
			console.log(data.toString("ascii"));
			// tnLib.handshake.convertBufferToArray(data);
		}
	}
});




// Stole the following exit functions and event listeners from StackOverflow https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
function exitHandler(options, exitCode) {
	socket.end();
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));





//KeyPress events for testing purposes only
process.stdin.on('keypress', (ch, key) => {
	if(key && key.name == "c"){

		let bufferToSend = dataStream.toHost("enter");
		if(bufferToSend.hasOwnProperty("error")){
			console.log(bufferToSend.error);
		}
		else{
			console.log(">>",bufferToSend.buff);
			socket.write(bufferToSend.buff);
		}
		
	}
});