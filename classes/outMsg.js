//tn3270eMsg.js

/**
 * TN3270E data message, usually used to send a new message
 * New object is declared with header and data. 
 * Header has to be an object containing dataType, requestFlag, responseFlag and seqNumber.
 * Data has to be an array
 */
class OutMsg{
    constructor(){
        this.header = {
            dataType: 0,
            requestFlag: 0,
            responseFlag: 0,
            seqNumber: [0,0]
        };
        /* this.header.dataType = 0;
        this.header.requestFlag = 0;
        this.header.responseFlag = 0;
        this.header.seqNumber = 0; */

        //Specifying a footer to apply at the end of the message, which is always IAC (255) EOR (239)
        this.footer = [255, 239]
    }

    /**
     * Will take the currently specified message and will wrap it in a cozy buffer. Buffer which is then returned
     * @returns {buffer}
     */
    wrap(data){
        let header = Buffer.from([this.header.dataType, this.header.requestFlag, this.header.responseFlag, this.header.seqNumber[0], this.header.seqNumber[1]]);
        let dataBuff = Buffer.from(data);
        let footer = Buffer.from(this.footer);
        let returnedBuff = Buffer.concat([header, dataBuff, footer]);
        return returnedBuff;
    }
}

module.exports = OutMsg;