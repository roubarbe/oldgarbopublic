//negociator.js
const config = require('../config');
const telnetLib = require('./telnetLib');
const asciiMethods = require('./asciiMethods');

/**
 * Used for Telnet negociations
 */
class Negociator{
    constructor(){
        this.terminalType = config.model;
        this.deviceType = config.model;
    }

    /**
     * Takes a buffer, checks what the server wants, and generates an answer based on the config.
     * Will return an object containing the "translated" query, and the appropriate response.
     * The returned object contains an "error" property if something went wrong
     * @param {buffer} data 
     * @returns {object} response
     */
    answerThis(data){
        // Let's define an answer object, for further usage. "human" means "human-readable"
        let response = {
            humanHost		:[],
            humanResponse	:[],
            buffResponse	:Buffer.from("")
        };

        //Let's first check if data is a buffer.
        if(Buffer.isBuffer(data)){
            // console.log(data);
            //Negociations always starts with an IAC (255)
            if(data[0] == telnetLib.commands.IAC){
                // iterating through our known requests
                let match = false;
                for(let i = 0; i < telnetLib.commonReqs.length; i++){
                    if(this.arrayComparator(data, telnetLib.commonReqs[i].hostSays.binary)){
                        // console.log(telnetLib.commonReqs[i].hostSays.human);
                        response.buffResponse = Buffer.from(telnetLib.commonReqs[i].clientSays.binary);
                        response.humanHost = telnetLib.commonReqs[i].hostSays.human;
                        response.humanResponse = telnetLib.commonReqs[i].clientSays.human;
                        match = true;
                        if(this.arrayComparator(data, [255, 253, 0, 255, 251, 0])){
                            response.dataStream = true;
                        }
                    }
                    
                    else if(this.arrayComparator(data.slice(0, 5), telnetLib.commonReqs[i].hostSays.binary)){
                        // If equals to IAC SB TN3270E DEVICE-TYPE IS
                        if(data[3] == 2){
                            let deviceTypeAndName = this.fetchDeviceTypeAndName(data);
                            response.humanHost = [telnetLib.commonReqs[i].hostSays.human, deviceTypeAndName.deviceName, "CONNECT", deviceTypeAndName.deviceType, "IAC", "SE"];
                            response.humanResponse = telnetLib.commonReqs[i].clientSays.human;
                            response.buffResponse = Buffer.from(telnetLib.commonReqs[i].clientSays.binary);
                            response.tn3270e = true;
                        }
                        // If equals to IAC SB TN3270E FUNCTIONS REQUEST
                        else if(data[3] == 3 && data[4] == 7){
                            // We just echo back the same functions it wants, no need to negociate that
                            let serverWants = data.slice(5, data.length - 2);
                            let serverWantsHuman = [];
                            
                            serverWants.forEach(fn =>{
                                serverWantsHuman.push(asciiMethods.getKeyByValue(telnetLib.tn3270e.functionNames, fn));
                            });
                            // console.log(serverWantsHuman);
                            
                            response.humanHost = [].concat(telnetLib.commonReqs[i].hostSays.human, serverWantsHuman, ["IAC", "SE"]);
                            response.humanResponse = [].concat(telnetLib.commonReqs[i].clientSays.human, serverWantsHuman, ["IAC","SE"]);
                            response.buffResponse = Buffer.from(telnetLib.commonReqs[i].clientSays.binary, serverWants, [255, 240]);
                            
                        }
                        else if(data[3] == 3 && data[4] == 4){
                            let serverWants = data.slice(5, data.length - 2);
                            let serverWantsHuman = [];
                            
                            serverWants.forEach(fn =>{
                                serverWantsHuman.push(asciiMethods.getKeyByValue(telnetLib.tn3270e.functionNames, fn));
                            });

                            response.tn3270Options = serverWants;
                            response.dataStream = true;
                            response.humanHost = [].concat(telnetLib.commonReqs[i].hostSays.human, serverWantsHuman, ["IAC","SE"]);
                        }
                        match = true;
                    }
                    else{
                        // response.humanHost = data;
                    }
                }
                // If no match found, it's an unknown request, which we have to translate
                if(match == false){
                    response.humanHost = data;
                }
            }
            //If it doesn't start with "IAC", then return the buffer untouched as a response
            else{
                response.buffResponse = data;
            }
        }
        else{
            response.error = "Negociator: data passed to answerThis method is not of type Buffer";
        }

        return response;
    }

    /**
     * Converts a string into a buffer. Will return an empty buffer if not a string or if invalid.
     * @param {string} text 
     * @returns {buffer} Buffer
     */
    stringToBinary(text){
        try{
            return Buffer.from(text, "ascii");
        }catch(e){
            return Buffer.from("");
        }
	}
	
	/**
	 * Uses the telnetLib object to translate binary into somewhat human-readable sentences
	 * @param {buffer} buff 
	 * @returns {array} human
	 */
	binToAscii(buff){
        return buff.toString("ascii");
	}

	/**
	 * Compares two arrays, and returns true if they're the same, false if not
	 * @param {array} array0 
	 * @param {array} array1 
	 * @returns {boolean} If the arrays are similar
	 */
	arrayComparator(array0, array1){
		if(array0.length === array1.length){
			let similarValues = 0;
			for(let i=0; i < array0.length; i++){
				if(array0[i] === array1[i]){
					similarValues = similarValues + 1;
				}
			}

			if(similarValues === array0.length){
				return true;
			}
			else{
				return false;
			}
		}
    }

    /**
     * Fetches the device type and name
     * @param {buffer} data 
     */
    fetchDeviceTypeAndName(data){
        let deviceTypeAndName = "";

        for(let i = 0; i < data.length; i++){
            if(data[i] >= 44 && data[i] <= 96){
                deviceTypeAndName += String.fromCharCode(data[i]);
            }

            if(data[i] == 1){
                deviceTypeAndName += " ";
            }
        }
        deviceTypeAndName = deviceTypeAndName.split(" ");
        return {"deviceName": deviceTypeAndName[0], "deviceType": deviceTypeAndName[1]}
    }
}

module.exports = Negociator;