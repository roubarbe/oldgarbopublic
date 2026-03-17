//inMsg.js

/**
 * Received TN3270E data message
 * Separates Header and data
 */
class InMsg{
/*     constructor(data){
        let unwrapped = this.unwrap(data);
        this.header = unwrapped.header;
        this.data = unwrapped.data;
        this.footer = unwrapped.footer;
    }
 */
    unwrap(data){
        let header;
        let footer;
        let msgData;

        if(data.length == 0){
            console.log("InMsg: Received data is empty");
        }
        else{
            header = this.extractHeader(data);
            footer = data.slice(data.length-2);

            if(data.length == 6){
                //no message data, since only header and footer are present (4 bytes + 2 bytes);
                msgData = [];
            }
            else{
                msgData = data.slice(5,data.length-2);
            }
        }

        return {"header": header, "data": msgData, "footer": footer};
        
    }

    extractHeader(data){
        let msgHeader = {
            dataType: 0,
            requestFlag: 0,
            responseFlag: 0,
            seqNumber: 0
        };
        
        let header = data.slice(0, 5);

        if(header.length == 5){
            //The first byte is the data-type
            msgHeader.dataType = header[0];
            
            //Second byte is the request-flag
            msgHeader.requestFlag = header[1];

            //Third byte is the response-flag
            msgHeader.responseFlag = header[2];

            //Fourth and fifth byte is the sequence number
            msgHeader.seqNumber = [header[3], header[3]];
        }

        return msgHeader;
    }
}

module.exports = InMsg;