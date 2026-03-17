//TN3270.js
let OutMsg = require("./classes/outMsg");
let InMsg = require("./classes/inMsg");

/**
 * The TN3270E class includes methods and properties relevant to processing TN3270E messages.
 * Inbound messages (received from the host) are processed and stored in the lastMessage property.
 * Outbound messages (sent to the host) are processed and stored in the last property.
 * More info about TN3270E data messages: https://tools.ietf.org/html/rfc2355#page-18
 */
class TN3270E {
    constructor(){
        this.lastMessage = {
            data: [],
            header:{
                dataType: 0,
                requestFlag: 0,
                responseFlag: 0,
                seqNumber: 0
            }
        };
    }

    /**
     * Takes a buffer and converts it into textual data. Stores the result in the class' lastMessage property.
     * @param {array} data Buffer sent to the method
     */
    inMessage(data){
        let receivedMsg = new InMsg(data);
    }


    /**
     * Will prepare data to be send as a TN3270E message. Requires a header to be specified
     * @param {object} header 
     * @param {array} data 
     */
    outMessage(header, data){
        let sentMessage = new OutMsg(header, data);
    }
}

module.exports = TN3270E;