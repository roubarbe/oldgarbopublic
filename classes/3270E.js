//3270E.js

let config = require("../config");

/*
    Library of methods useful to parsing through the buffer.
*/

let lib3270E = {
	bufferAddresses:{
		twoBytesToXYPosition(firstByte, secondByte){
			let firstByteBin = firstByte.toString(2);
			firstByteBin = "00000000".substring(firstByteBin.length) + firstByteBin;

			let typeOfAddress = firstByteBin.slice(0,2);

			let index = 0;
					
			// If the next byte starts with either 01 or 11, it's a 12-bit coded address
			if(typeOfAddress == "01" || typeOfAddress == "11"){
				let secondByteBin = secondByte.toString(2);
				secondByteBin = "00000000".substr(secondByteBin.length) + secondByteBin;

				index = parseInt(firstByteBin.substr(2, 7) + secondByteBin.substr(2, 7), 2);
			}
			// If it starts with 00, it's a 14-bit address
			else if(typeOfAddress == "00"){
				console.log("14 bit");
			}

			let xyPosition = this.indexToXYPosition(index);

			return xyPosition;
		},
		
		indexToXYPosition(index){
			let row = Math.floor(index/this.columns);
			let column = index % this.columns;
			return [row, column];
		},

		/**
		 * Take an X/Y position and returns it into a 12-bit encoded address
		 * @param {number} x 
		 * @param {number} y 
		 * @returns {array} Array containing the two bytes
		 */
		xyPosToBytes(x,y){
			// Convert X and Y position into index
			let addressIndex = x * y;

			// Make it into 16-bit binary
			let addressIndexBin = addressIndex.toString(2);
			addressIndexBin = "0000000000000000".substring(addressIndexBin.length) + addressIndexBin;

			// Get 12-bit address (last 12 bits)
			let firstPartAddrBin = addressIndexBin.substring(4, 10);
			let secondPartAddrBin = addressIndexBin.substring(10);

			// Make into two 8 bit bytes, with "01" added to the first one to mean it's a 12-bit address
			firstPartAddrBin = "01" + firstPartAddrBin;
			secondPartAddrBin = "00" + secondPartAddrBin;

			let firstPartAddrByte = parseInt(firstPartAddrBin, 2);
			let secondPartAddrByte = parseInt(secondPartAddrBin, 2);

			return [firstPartAddrByte, secondPartAddrByte];
		}
	},
	fieldDefinitions:{
		parseByte(byte){
			let byteBin = byte.toString(2);
			byteBin = "00000000".substring(byteBin.length) + byteBin;

			/* let fieldDefinition = {
				graphicChar: 0,
				protected: 0,
				alphaNum: 0,
				typeDisplay: 0,
				modified: 0
			}; */

			let fieldDefArray = [];

			let bitsZeroOne = byteBin.substring(0, 2);
			let bitsFourFive = byteBin.substring(4, 6);

			// Graphics Character
			fieldDefArray.push(parseInt(bitsZeroOne, 2));
			// fieldDefinition.graphicChar = parseInt(bitsZeroOne, 2);

			// If the field is now protected or not
			fieldDefArray.push(byteBin[2]);
			// fieldDefinition.protected = byteBin[2];
			/* if(byteBin[2] == 1){
				fieldDefinition.protected = 1;
			} */
			
			// Alpha Numeric or Numeric-only, false is alpha and true is numeric
			fieldDefArray.push(byteBin[3]);
			// fieldDefinition.alphaNum = byteBin[3];
			/* if(byteBin[3] == 1){
				fieldDefinition.alphaNum = 1;
			} */

			// Type of display
			fieldDefArray.push(parseInt(bitsFourFive, 2));
			// fieldDefinition.typeDisplay = parseInt(bitsFourFive, 2);

			// If the field was modified
			fieldDefArray.push(byteBin[7])
			// fieldDefinition.modified = byteBin[7];
			/* if(byteBin[7] == 1){
				fieldDefinition.modified = 1;
			} */

			// Bits 4 and 5 are for type of display. So we add them together and calculate the value.
			/* let displayTypeValue = nextByteBin[4]+nextByteBin[5];
			displayTypeValue = parseInt(displayTypeValue, 2);
			currFieldDefinition.typeDisplay = displayTypeValue; */

			return fieldDefArray;
		}
	}
};

module.exports = lib3270E;