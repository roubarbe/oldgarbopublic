//asciiMethods.js

let asciiMethods = {
    convertStringToAsciiArray: function(myString){
		let returnArray = [];
		for(let i = 0; i < myString.length; i++){
			returnArray.push(myString.charCodeAt(i));
		}

		return returnArray;
	},

	getKeyByValue: function(object, value) {
		return Object.keys(object).find(key => object[key] === value);
	}
}

module.exports = asciiMethods;