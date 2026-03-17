const config = {
    host: "hostaddress",
	port: 23,
	model: "IBM-3278-2-E",
	// model: "VT220",
	binary: true,
	dataStream: false,
	columns: 80,
	rows: 24,
	deviceName: "",
	functionsList: [0,1,2,3,4],
	tn3270e: false,
	colors:{
		protected:[
			"blueBright", // 0
			"green", // 1
			"white", // 2
			"red" // 3
		],
		unprotected:[
			"white",
			"green",
			"yellow",
			"red"
		]
		
	}
}

module.exports = config;