//screenBuffer.js
const config = require("../config");

const chalk = require('chalk');

const EBCDIC = require("./EBCDIC");
let ebc = new EBCDIC();

/**
 * Manages a false Screen Buffer
 */
class ScreenBuffer{
    constructor(){
        this.rows = config.rows;
        this.columns = config.columns;
        this.screenBuffer = new Array(this.rows);
        this.bufferAddress = [0,0];
        this.cursorAddress = [0,0];
        for(let i = 0; i < this.screenBuffer.length; i++){
            this.screenBuffer[i] = new Array(this.columns)
        }
        this.clearBuffer();
    }

    /**
     * Clears all data from the screenBuffer
     */
    clearBuffer(){
        for(let i = 0; i < this.screenBuffer.length; i++){
            for(let e = 0; e < this.screenBuffer[i].length; e++){
                this.screenBuffer[i][e] = undefined;
            }
        }
        this.bufferAddress = [0,0];
        console.log("Buffer cleared!");
    }


    /**
     * Console logs all rows in the display buffer.
     */
    printBuffer(){
        for(let i = 0; i < this.screenBuffer.length; i++){
            let row = "";
            for(let e = 0; e < this.screenBuffer[i].length; e++){
                if(this.screenBuffer[i][e] == undefined){
                    row += " ";
                }
                else{
                    // If protected field
                    if(this.screenBuffer[i][e].fieldDefinition.protected){
                        if(this.screenBuffer[i][e].dec == undefined){
                            row += chalk[config.colors.protected[this.screenBuffer[i][e].fieldDefinition.typeDisplay]](" ");
                        }
                        else{
                            row += chalk[config.colors.protected[this.screenBuffer[i][e].fieldDefinition.typeDisplay]](ebc.decToAscii(this.screenBuffer[i][e].dec));
                        }
                    }
                    // If unprotected field
                    else{
                        if(this.screenBuffer[i][e].dec == undefined){
                            row += chalk.bgWhite.black(" ");
                        }
                        else{
                            row += chalk.bgWhite.black(ebc.decToAscii(this.screenBuffer[i][e].dec));
                        }
                    }
                }
            }
            console.log(row);
        }
    }


    returnBuffer(){
        let returnArray = [];
        // console.log(this.screenBuffer);
        for(let i = 0; i < this.screenBuffer.length; i++){
            for(let e = 0; e < this.screenBuffer[i].length; e++){
                // console.log(this.screenBuffer[i][e]);
                if(this.screenBuffer[i][e] === undefined){
                    returnArray.push(null);
                }
                else if(this.screenBuffer[i][e].isSF){
                    returnArray.push(29);
                    returnArray.push(parseInt(this.screenBuffer[i][e].fieldAttribute, 2));
                }
                else{
                    returnArray.push(this.screenBuffer[i][e].dec);
                }
            }
        }
        // console.log(Buffer.from(returnArray));
        return Buffer.from(returnArray);
    }

    setAddressFromIndex(address){
        // console.log(address);
        this.bufferAddress = this.convertIndexToMatrix(address);
    }

    /**
     * Converts a decimal address into a matrix array representing the position in the buffer array
     * @param {number} address Address in decimal
     * @returns {array} the equivalant array position
     */
    convertIndexToMatrix(address){
        /* let totalChars = this.rows * this.columns;
        let row = 0;
        let column = 0; */
        
        let row = Math.floor(address/this.columns);
        let column = address % this.columns;
        return [row, column];
    }


    /**
     * Converts an X,Y matrix into an index
     * @param {array} matrix Address as an X,Y array
     * @returns {number} the equivalant index position
     */
    convertMatrixToIndex(matrix){
        return matrix[0]*matrix[1];
    }


    incrementAddress(){
        let currentAddress = this.bufferAddress;
        if(currentAddress[1] == this.columns){
            if(currentAddress[0] <= this.rows){
                currentAddress[1] = this.columns;
            }
        }
        else{
            currentAddress[1] = currentAddress[1] + 1;

        }

        this.bufferAddress = currentAddress;
    }

    getCursorPositionBytes(){
        let bufferAddress = this.bufferAddress;
        let cursorIndex = (bufferAddress[0] * bufferAddress[1]).toString(2);
        cursorIndex = "0000000000000000".substr(cursorIndex.length) + cursorIndex;

        let cursorFirstByte = cursorIndex.slice(0, 10);
        let cursorSecondByte = cursorIndex.slice(10);

        return Buffer.from([parseInt(cursorFirstByte, 2), parseInt(cursorSecondByte, 2)]);
    }


    writeChar(char, currFieldDefinition, isSF){
        // this.incrementAddress();
        let currentAddress = this.bufferAddress;
        let indexObject;

        /* if(char !== undefined){
            if(ebc.decToAscii(char) == "="){
                console.log("=");
            }
        } */

        if(!isSF){
            indexObject = {
                "dec": char,
                "fieldDefinition": Object.assign({}, currFieldDefinition)
            }
        }
        else{
            indexObject = {
                "dec": char,
                "fieldDefinition": Object.assign({}, currFieldDefinition),
                "isSF": isSF
            }
        }

        this.screenBuffer[currentAddress[0]][currentAddress[1]] = indexObject;
       
        this.incrementAddress();
    }
}

module.exports = ScreenBuffer;