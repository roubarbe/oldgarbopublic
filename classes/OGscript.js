//OGscript.js

/*
	You want to automate Old Garbo? Well I devised a quick way to do that.
	This could change in the future.

	This requires a bit of knowledge of the TN3270 data-stream.

	Welcome to OGscript.

	A command is defined as a Verb. Its parameters are Adjectives. 
	A combination of both is an Action.
	A series of Actions is a Sentence.
	A series of Sentences is a Chapter.
	A collection of Chapters is a Book.

	It doesn't look like natural-language, but it's cute.

	OGscript is vocabulary-heavy, but easy to grasp.

	Let's say you want to move the buffer address to a specific position.
	You can type:
		"SBA:23/08"
		SBA refers here to "Start Buffer Address", and then: the XY position.

		"SF:0/1/0/0/0"
		SF refers here to "Start Field", and then: 
		Graphic EBCDIC Char / Protected / Alphanumeric / Display / Unmodified

	Booleans (true/false) are always defined as 1 or 0.
	Else, it's the number representation of binary (3 for '10').

	Each Adjective is separated by a forward slash (could change in the future)
	Each Action is separated by a comma. You can add a space or a new-line for readability,
	it'll get removed by the parser anyways.
	Each sentence is separated by a colon (;)
	
	SBA:23/08, SFA:0/2/0/0/0, INS:Hello;
	SBA:23/13, SFA:0/2/0/0/0, INS:\:;
	SBA:23/18, SFA:0/2/0/0/0, INS:Pistachio;

	Those three sentences mean:
	Move to position 23/08, start a field, insert text "Hello"
	Move to position 23/13, start a field, insert text ":"
	Move to position 23/18, start a field, insert text "Pistachio"

	Notice the backwards slash behind ":", this indicates not to use it as a divider.
	So it's a normal escape character.

	A later subset of OGscript will be used to facilitate data entry/fetch.
*/

let lib3270e = require('./3270E');
let EBCDIC = require('./EBCDIC');
let ebc = new EBCDIC();

class OGscript{
	constructor(){
		this.dictionary = {
			"SBA":{
				"definition":"Start Buffer Address: We're moving the buffer to another position.",
				"minAdjectives": 2,
				"maxAdjectives": 2,
				"adjectivesNecessary": true,
				"decimalValue": 17
			},
			
			"SF":{
				"definition":"Start Field: Indicates the start of a field",
				"minAdjectives": 4,
				"maxAdjectives": 4,
				"adjectivesNecessary": true,
				"decimalValue": 29
			},
			
			"IC":{
				"definition":"Insert Cursor: Places the cursor to the last written buffer address",
				"minAdjectives": 0,
				"maxAdjectives": 0,
				"adjectivesNecessary": false,
				"decimalValue": 19
			},
			
			"PT":{
				"definition":"Program Tab: Advance to next unprotected field",
				"minAdjectives": 0,
				"maxAdjectives": 0,
				"adjectivesNecessary": false,
				"decimalValue": 5
			},
			
			"RA":{
				"definition":"Repeat to Address: Repeat a specified character until specified buffer address reached",
				"minAdjectives": 2,
				"maxAdjectives": 2,
				"adjectivesNecessary": true,
				"decimalValue": 60
			},

			"INV":{
				"definition":"Invalid: Verb does not exist (yet) in OGscript",
				"minAdjectives": 0,
				"maxAdjectives": 0,
				"adjectivesNecessary": false,
				"decimalValue": 0
			},

			"INS":{
				"definition":"Insert: Write a character",
				"minAdjectives": 1,
				"maxAdjectives": 999,
				"adjectivesNecessary": true,
				"decimalValue": 0
			}
		};

		this.escapedCharacters = [
			"\\",
			";",
			",",
			" "
		];
	}

	/**
	 * Takes a sentence, removes all white-space, divides into an array and then returns it.
	 * @param {string} sentence 
	 * @returns {array}
	 */
	sentenceToArray(sentence){
		// Removing whitespaces before and after sentence
		sentence = sentence.trim();

		// Dividing the sentence into an array by the character ","
		let sentenceArray = sentence.split(/(?<!\\),+/g);

		return actionsArray;
	}

	/**
	 * Takes a chapter and divides it into an array of sentences, returns it.
	 * @param {string} chapter 
	 * @returns {array}
	 */
	chapterToSentences(chapter){
		// Remove whitespace behind and after chapter
		chapter = chapter.trim();

		// Removing whitespace in everything
		chapter = chapter.replace(/(?<!\\)\s+/g);

		// Divides sentences by the character ";"
		let sentencesArray = chapter.split(/(?<!\\);+/g);

		return sentencesArray;
	}

	/**
	 * Converts a buffer into a sentence
	 * @param {buffer} buff 
	 * @returns {array} Proper OGscript sentence representation of what the host sent
	 */
	bufferToSentence(buff){
		// let chapter;
		let sentence = [];
		for(let i = 0; i < buff.length; i++){
			
			// keeping touch of the next byte
			let nextByte = buff[i+1];
			let nextByteBin = nextByte.toString(2);
			nextByteBin = "00000000".substring(nextByteBin.length) + nextByteBin;

			switch(buff[i]){
				// PT: Program Tab
				case 5:
					console.log("PT");
					break;
				
				// GE: Graphic Escape
				case 8:
					console.log("GE");
					break;
				
				// SBA, changes buffer address
				case 17:
					console.log("SBA");
					sentence.push(this.actionGenerator('SBA', lib3270e.bufferAddresses.twoBytesToXYPosition(buff[i+1], buff[i+2])))
					
					// Jumping 2 bytes forwards, will get incremented +1 at next loop;
					i = i + 2;
					break;

				// EUA: Erase Unprotected To Address
				case 18:
					console.log("EUA");
					break;
				
				// IC: Insert Cursor at last bufferAddress
				case 19:
					console.log("IC");
					sentence.push(this.actionGenerator('IC'));
					break;
				
				// SF: changes field definition
				case 29:
					console.log("SF");
					sentence.push("SF", lib3270e.fieldDefinitions.parseByte(nextByte));

					// Since this is a 2 byte section, we skip one position, which gets incremented once more next loop
					i = i + 1;
					break;
				
				// SA: Set Attribute
				case 40:
					console.log("SA");
					break;
				
				// SFE: Start Field Extended
				case 41:
					console.log("SFE");
					break;
				
				// MF: Modify Field
				case 44:
					console.log("MF")
					break;

				// RA: Repeat To Address
				case 60:
					console.log("RA");
					sentence.push(this.actionGenerator("RA", lib3270e.bufferAddresses.twoBytesToXYPosition(buff[i+1],buff[i+2]).concat(buff[i+3])));
					
					// Jumping 3 bytes forwards, will get incremented +1 at next loop;
					i = i + 3;
					break;
				
				default:
					// Normal character, insert one at a time
					sentence.push(this.actionGenerator("INS", buff[i]));
			}
		}
		return sentence;
	}

	/**
	 * Takes a string sentence, makes it into an array
	 * @param {string} sentence 
	 */
	sentenceToBuffer(sentence){
		let buffArray = [];

		console.log(sentence);

		let arrayFromSentence = this.sentenceToArray(sentence);

		for(let i = 0; i < arrayFromSentence.length; i++){
			console.log(arrayFromSentence[0])
			let divided = arrayFromSentence[i].trim().split(":");

			switch(divided[0]){
				// PT: Program Tab
				case "PT":
					console.log("PT");
					break;
				
				// GE: Graphic Escape
				case "GE":
					console.log("GE");
					break;
				
				// SBA, changes buffer address
				case "SBA":
					console.log("SBA");
					buffArray.concat([17], lib3270e.bufferAddresses.xyPosToBytes(divided[1].split("/")));
					break;

				// EUA: Erase Unprotected To Address
				case "EUA":
					console.log("EUA");
					break;
				
				// IC: Insert Cursor at last bufferAddress
				case "IC":
					console.log("IC");
					buffArray.push(19);
					break;
				
				// SF: changes field definition
				case "SF":
					console.log("SF");
					buffArray.concat([29, this.fieldAdjectivesToByte(divided[1])]);
					break;
				
				// SA: Set Attribute
				case "SA":
					console.log("SA");
					break;
				
				// SFE: Start Field Extended
				case "SFE":
					console.log("SFE");
					break;
				
				// MF: Modify Field
				case "MF":
					console.log("MF")
					break;

				// RA: Repeat To Address
				case "RA":
					console.log("RA");
					buffArray.concat([60], this.repeatAdjectivesToBytes(divided[1]));
					break;

				case "INS":
					buffArray.concat(this.characterArray(divided[1]));
				
				default:
					// unknown command, push a zero in the buffer
					buffArray.push(0);
			}
		}

		return Buffer.from(buffArray);
		
	}

	/**
	 * Takes a verb and given adjectives. 
	 * 
	 * If the verb is not known: "INV" is given back with adjective "0"
	 * 
	 * If the verb is known: checks the number of adjectives given and if they're necessary.
	 * 
	 * If the number of adjectives are lower than the minimum, then zeroes are added to meet the minimum.
	 * If the number of adjectives are higher than the maximum, then only the necessary amount is taken.
	 * 
	 * If no adjectives necessary: then they're ignored and "0" is given as a single adjective.
	 * 
	 * @param {string} verb 
	 * @param {array} adjectives 
	 * @returns {string} Name of verb : Adjectives
	 */
	actionGenerator(verb, adjectives){
		let adjectivesToReturn = "";
		let thisVerb = {};

		if(this.dictionary.hasOwnProperty(verb)){
			thisVerb = this.dictionary[verb];

			let adjectivesToReturn = "";

			if(thisVerb.adjectivesNecessary){
				if(adjectives.length >= thisVerb.minAdjectives){
					adjectivesToReturn = adjectives.slice(0, thisVerb.maxAdjectives).join("/");
				}
				else{
					adjectivesToReturn = adjectives.join("/");
					let missingArgsDec = thisVerb.minAdjectives - adjectives.length;
					// I don't know any other way to do this than that
					let missingAdjs = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
					adjectivesToReturn += "/" + missingAdjs.slice(0, missingArgsDec).join("/");
				}
			}
			else{
				adjectivesToReturn += "0"
			}
			return verb+":"+adjectivesToReturn;
		}
		else{
			return 'INV:'+adjectives.join('/');
		}
	}


	/**
	 * Takes the adjectives string for a Field Definition, and makes a byte out of it
	 * @param {string} adjectives 
	 * @returns {number}
	 */
	fieldAdjectivesToByte(adjectives){
		let adjectivesArray = adjectives.split("/");
		let returnByte = "";

		// Graphic EBCDIC Char / Protected / Alphanumeric / Display / Unmodified
		// GRAPHIC
		let graphicBin = adjectivesArray[0].toString(2);
		returnByte += graphicBin;  // Should be two bits

		// PROTECTED
		returnByte += adjectivesArray[1];

		//ALPHANUMERIC
		returnByte += adjectivesArray[2]

		//DISPLAY TYPE
		let displayBin = adjectivesArray[3].toString(2);
		returnByte += displayBin;

		// RESERVED
		returnByte += "0";

		//MODIFIED
		returnByte += adjectivesArray[4];

		// to decimal
		returnByte = parseInt(returnByte, 2);

		returnByte;
	}


	/**
	 * Takes the adjectives string for a Repeat Address, and makes an array of byte out of it
	 * @param {string} adjectives 
	 * @returns {array}
	 */
	repeatAdjectivesToBytes(adjectives){
		let adjectivesArray = adjectives.split("/");
		let returnArray = [];

		let positionBytes = lib3270e.bufferAddresses.xyPosToBytes(adjectivesArray[0],adjectivesArray[1]);
		returnArray.concat(positionBytes, [adjectivesArray[2]]);

		return returnArray;

	}

	/**
	 * Takes a string and converts it into an array of integers, following the EBCDIC table
	 * @param {*} characters 
	 */
	characterArray(characters){
		let returnArray = []
		for(let i = 0; i < characters.length; i++){
			returnArray.push(ebc.asciiToDec(characters[i]));
		}

		return returnArray;
	}
}

module.exports = OGscript;