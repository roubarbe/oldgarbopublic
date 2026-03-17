//telnetLib.js
const config = require("../config");
const asciiMethods = require("./asciiMethods");

// Library of TELNET commands and options, including TN3270E extensions
let telnetLib = {
	commands: {
		"IAC"	:255,	// Interpret As Command
		"DONT"	:254,	// Stop/Not performing a specific option
		"DO"	:253,	// Performing a specific option
		"WONT"	:252,	// Refusing to perform a specific option
		"WILL"	:251,	// Desire to begin/Confirm a specific option
		"SB"	:250,	// Subnegotiation of the following options
		"GA"	:249,	// Go Ahead, it's your turn now
		"EL"	:248,	// Erase line, deletes all the previous characters until the last carriage return and line feed (CRLF)
		"EC"	:247,	// Erase character, deletes the last entered character
		"AYT"	:246,	// Are You There? Keep Alive
		"AO"	:245,	// Abort Output. Flush the screen
		"IP"	:244,	// Suspend, Interrupt or abort the process
		"BRK"	:243,	// Break. The BRK or ATTN key was hit
		"DM"	:242,	// Data Mark. Position of Synch Event, always accompany with TCP Urgent notification"
		"NOP"	:241,	// No Operation
		"SE"	:240,	// Subnegociations End, end of subnegociations parameters
		"NOP"	:239	// End Of Records, end of data transmission
	},

	options:{
		"EXOPL"					:255,	// Extended-Options-List: future options that can't fit between 0 to 255.
		"PRAGMA_HEARBEAT"		:140,	// NOT AN IETF STANDARD
		"SSPI_LOGON"			:139,	// NOT AN IETF STANDARD
		"PRAGMA_LOGON"			:138,	// NOT AN IETF STANDARD
		"FORWARD_X"				:49,	// Forward X Window Information
		"SEND_URL"				:48,	// Exchange URL Information
		"KERMIT"				:47,	// KERMIT file protocol (not the frog, but probably is)
		"START_TLS"				:46,	// Start TLS encryption
		"SLE"					:45,	// SUPPRESS-LOCAL-ECHO: Won't echo locally input characters
		"COM_PORT_OPTION"		:44,	// Negociation modem options
		"RSP"					:43,	// Remote Serial Port: Set up a listener on a COM port
		"CHARSET"				:42,	// Which charset to use
		"XAUTH"					:41,	// NOT AN IETF STANDARD
		"TN3270E"				:40,	// TN3270E negociations
		"NEW_ENVIRON"			:39,	// Pass environment information
		"ENCRYPT"				:38,	// Supports encryption
		"AUTHENTICATION"		:37,	// Lets the client and server negotiate a method of authentication to secure connections.
		"ENVIRON"				:36,	// Environment information
		"X_DISPLAY_LOCATION"	:35,	// Send the X Display window location
		"LINEMODE"				:34,	// Allows the client to send data one line at a time instead of one character at a time
		"TOGGLE-FLOW-CONTROL"	:33,	// Allows flow control between the client and the server to be enabled and disabled.
		"TERMINAL-SPEED"		:32,	// Allows devices to report on the current terminal speed.
		"NAWS"					:31,	// Permits communication of the size of the terminal window.
		"X3_PAD"				:30,	// Pre-Process characters
		"REGIME_3270"			:29,	// Support 3270 Data Stream on Telnet
		"TTYLOC"				:28,	// Terminal location (like in physical location)
		"OUTMRK"				:27,	// Output Marking: The host sends a banner to display on the terminal.
		"TUID"					:26,	// TelNet User Identification
		"EOR"					:25,	// End Of Records
		"TERMINAL-TYPE"			:24,	// Allows the client and server to negotiate the use of a specific terminal type.
		"SEND_LOCATION"			:23,	// Send the user's location using NAME/FINGER protocol
		"SUPDUP_OUTPUT"			:22,	// Use another user as display
		"SUPDUP"				:21,	// Use another user as display
		"DET"					:20,	// Send and receive subcommands to control the Data Entry Terminal.
		"BM"					:19,	// Does not mean "Body Massage": Byte Macro. Send single data characters which are to be interpreted as if replacement data strings had been sent.
		"LOGOUT"				:18,	// Force Log Out
		"EXTEND-ASCII"			:17,	// Lets devices agree to use extended ASCII for transmissions and negotiate how it will be used.
		"NAOLFD"				:16,	// Allows devices to decide how line feed characters should be handled.,
		"NAOVTD"				:15,	// Lets devices negotiation the disposition of vertical tab stops.
		"NAOVTS"				:14,	// Used to determine what vertical tab stop positions will be used for output display.
		"NAOFFD"				:13,	// Allows the devices to negotiation how form feed characters will be handled.
		"NAOHTD"				:12,	// Allows the devices to negotiation how horizontal tabs will be handled and by which end of the connection.
		"NAOHTS"				:11,	// Allows the devices to determine what horizontal tab stop positions will be used for output display.
		"NAOCRD"				:10,	// Lets the devices negotiate how carriage returns will be handled.
		"NAOP"					:9,		// Negotiate Output Page Size
		"NAOL"					:8,		// Negotiate Output Line Width
		"RCTE"					:7,		// Remote Controlled Trans and Echo (remote-controlled trans goth GF)
		"TIMING-MARK"			:6,		// Allows devices to negotiate the insertion of a special timing mark into the data stream, which is used for synchronization.
		"STATUS"				:5,		// Lets a device request the status of a Telnet option.
		"AMSN"					:4,		// Not the Mac MSN Messenger Client: Approximate Message Size Negociations
		"SUPPRESS-GO-AHEAD"		:3,		// Allows devices not operating in half-duplex mode to no longer need to end transmissions using the Telnet Go Ahead command.
		"RECONNECT"				:2,		// Launches the reconnect process
		"ECHO"					:1,		// Output entered text
		"TRANSMIT-BINARY"		:0		// Following bytes are binary data
	},

	tn3270e:{
		commands:{
			"SEND"			:8,	// Send information
			"REQUEST"		:7,	// Requesting a specified ressource
			"REJECT"		:6,	// Request rejected, followed by "REASON"
			"REASON"		:5,	// Reason for rejection
			"IS"			:4,	// Specifies a ressource name
			"FUNCTIONS"		:3,	// This command is used to suggest a set of 3270 functions that will be supported on this session.
			"DEVICE-TYPE"	:2,	// Device-type negociations
			"CONNECT"		:1,	// You can connect to 'this' ressource
			"ASSOCIATE"		:0,	// Associate a printer to this session
		},

		reasonCodes:{
			"UNSUPPORTED-REQ"	:7,	// The server is unable to satisfy the type of request sent by the client; e.g., a specific terminal or printer was requested but the server does not have any such pools of device-names defined to it, or the ASSOCIATE command was used but no partner printers are defined to the server.
			"UNKNOWN-ERROR"		:6,	// Any other error in device type or name processing has occurred.
			"TYPE-NAME-ERROR"	:5,	// The requested device-name or resource-name is incompatible with the requested device-type (such as terminal/printer mismatch).
			"INV-DEVICE-TYPE"	:4,	// Invalid Device Type: The server does not support the requested device-type.
			"INV-NAME"			:3,	// Invalid Name: The resource-name or device-name specified in the CONNECT or ASSOCIATE command is not known to the server.
			"INV-ASSOCIATE"		:2,	// Invalid Associate: The client used the ASSOCIATE command and either the device-type is not a printer or the device-name is not a terminal.
			"DEVICE-IN-USE"		:1,	// The requested device-name is already associated with another session.
			"CONN-PARTNER"		:0	// The client used the CONNECT command to request a specific printer but the device-name requested is the partner to some terminal.
		},

		functionNames:{
			"SYSREQ"			:4,	// Allows the client and server to emulate some (or all, depending on the server) of the functions of the SYSREQ key in an SNA environment.
			"SCS-CTL-CODES"		:3,	// (Printer sessions only). Allows the use of the SNA Character Stream (SCS) and SCS control codes on the session. SCS is used with LU type 1 SNA sessions.
			"RESPONSES"			:2,	// Provides support for positive and negative response handling. Allows the server to reflect to the client any and all definite, exception, and no response requests sent by the host application.
			"DATA-STREAM-CTL"	:1,	// (Printer sessions only). Allows the use of the standard 3270 data stream. This corresponds to LU type 3 SNA sessions.
			"BIND-IMAGE"		:0	// Allows the server to send the SNA Bind image and Unbind notification to the client.
		}
	},

	/* "commonReqs":{
		doTN3270e:				[255, 253, 40],	//IAC DO TN3270E
        willTN3270e:			[255, 251, 40],	//IAC WILL TN3270E
		sbSendDeviceType:		[255, 250, 40, 8, 2, 255, 240],	//IAC SB TN3270E SEND DEVICE-TYPE IAC SE
		sbSendDeviceTypeReq:	[255, 250, 40, 2, 7, config.model, 255, 240], //IAC SB TN3270E DEVICE-TYPE REQUEST model IAC SE
		doTerminalType:			[255, 253, 24],	//IAC DO TERMINAL-TYPE
		willTerminalType:		[255, 251, 24],	//IAC WILL TERMINAL-TYPE
		sbTerminalTypeEcho: 	[255, 250, 24, 1, 255, 240],	//IAC SB TERMINAL-TYPE ECHO IAC SE
		sbTerminalType:			[255, 250, 24, 0, config.model, 255, 240],	//IAC SB TERMINAL-TYPE BINARY model IAC SE
		doEorWillEor:			[255, 253, 25, 255, 251, 24],	//IAC DO EOR IAC WILL EOR
		willEorDoEor:			[255, 251, 25, 255, 253, 25],	//IAC WILL EOR IAC DO EOR
		doBinWillBin:			[255, 253, 0, 255, 251, 0],	//IAC DO BINARY IAC WILL BINARY
		willBinDoBin:			[255, 251, 0, 255, 253, 0]	//IAC WILL BINARY IAC DO BINARY
	} */

	"commonReqs":[
		{
			hostSays:{
				binary:	[255, 253, 40],
				human:	["IAC","DO","TN3270E"]
			},
			clientSays:{
				binary:	[255, 251, 40],
				human:	["IAC", "WILL", "TN3270E"]
			}
		},
		{
			hostSays:{
				binary: [255, 250, 40, 8, 2, 255, 240],
				human:	["IAC","SB","TN3270E","SEND","DEVICE-TYPE","IAC","SE"]
			},
			clientSays:{
				binary:	[255, 250, 40, 2, 7].concat(asciiMethods.convertStringToAsciiArray(config.model), [255, 240]), //IAC SB TN3270E DEVICE-TYPE REQUEST model IAC SE]
				human:	["IAC", "SB", "TN3270E", "DEVICE-TYPE", "REQUEST", config.model, "IAC", "SE"]
			}
		},
		{
			hostSays:{
				binary:	[255, 253, 24],
				human:	["IAC","DO","TERMINAL-TYPE"]
			},
			clientSays:{
				binary:	[255, 251, 24],
				human:	["IAC","WILL","TERMINAL-TYPE"]
			}
		},
		{
			hostSays:{
				binary:	[255, 250, 24, 1, 255, 240],	//IAC SB TERMINAL-TYPE ECHO IAC SE
				human:	['IAC', 'SB', 'TERMINAL-TYPE', 'ECHO', 'IAC', 'SE']
			},
			clientSays:{
				binary:	[255, 250, 24, 0].concat(asciiMethods.convertStringToAsciiArray(config.model), [255, 240]),
				human:	["IAC", "SB", "TERMINAL-TYPE", "TRANSMIT-BINARY", config.model, "IAC", "SE"]
			}
		},
		{
			hostSays:{
				binary:	[255, 253, 25, 255, 251, 25],
				human:	['IAC', 'DO', 'EOR', 'IAC', 'WILL', 'EOR']
			},
			clientSays:{
				binary:	[255, 251, 25, 255, 253, 25],
				human:	['IAC', 'WILL', 'EOR', 'IAC', 'DO', 'EOR']
			}
		},
		{
			hostSays:{
				binary:	[255, 253, 0, 255, 251, 0],
				human:	['IAC', 'DO', 'TRANSMIT-BINARY', 'IAC', 'WILL', 'TRANSMIT-BINARY']
			},
			clientSays:{
				binary:	[255, 251, 0, 255, 253, 0],
				human:	['IAC', 'WILL', 'TRANSMIT-BINARY', 'IAC', 'DO', 'TRANSMIT-BINARY']
			}
		},
		{
			hostSays:{
				binary:	[255, 250, 40, 2, 4],
				human:	["IAC", "SB", "TN3270E", "DEVICE-TYPE", "IS"]
			},
			clientSays:{
				binary:	[255, 250, 40, 3, 7, 0, 2, 4, 255, 240],
				human:	["IAC", "SB", "TN3270E", "FUNCTIONS", "REQUEST", "BIND-IMAGE", "RESPONSES", "SYSREQ", "IAC", "SE"]
			}
		},
		{
			hostSays:{
				binary:	[255, 250, 40, 3, 7],
				human:	["IAC", "SB", "TN3270E", "FUNCTIONS", "REQUEST"]
			},
			clientSays:{
				binary:	[255, 250, 40, 3, 7],
				human:	["IAC", "SB", "TN3270E", "FUNCTIONS", "REQUEST"]
			}
		},
		{
			hostSays:{
				binary:	[255, 250, 40, 3, 4],
				human:	["IAC", "SB", "TN3270E", "FUNCTIONS", "IS"]
			},
			clientSays:{
				binary:	[],
				human:	[]
			}
		}
	]
};

module.exports = telnetLib;