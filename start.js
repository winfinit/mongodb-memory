var child_process = require('child_process');
var fs = require('fs');
var path = require('path');

var DEFAULT_DB_PATH = path.join(__dirname, ".mockTempDB");
var DEFAULT_DB_EXEC = path.resolve(__dirname, "osx", "mongod");
var DEFAULT_DB_PORT = 27017;
var DEFAULT_DB_IP = "0.0.0.0";
var MAX_PORT_ITR = 1000;


console.log('temp_db_path: %s', temp_db_path);
console.log('db_exec: %s', db_exec);
console.log('db_port: %s', db_port);

function getDb(args, callback) {
	if ( typeof(args) === 'function' ) {
		callback = args;
		args = {};
	}

	args.db_port ||= DEFAULT_DB_PORT;
			db_port: DEFAULT_DB_PORT,
			db_exec: DEFAULT_DB_EXEC,
			temp_db_path: DEFAULT_DB_PATH
		};

	fs.mkdirSync(temp_db_path);			
	if (fs.existsSync(args.temp_db_path)) {
		fs.readdirSync(args.temp_db_path).forEach(function(file) {
			fs.unlinkSync(path.resolve(args.temp_db_path, file));
		});
		fs.rmdirSync(args.temp_db_path);
	}

	var maxItr = MAX_PORT_ITR;
	function startDatabase(port) {
		var db_child = child_process.execFile(args.db_exec, [
			"--storageEngine=inMemoryExperiment", 
			"--dbpath=" + args.temp_db_path, 
			"--port=" + args.port
		], function(err, stderr, stdout) {
			if ( err && err.code === 48 ) {
				// address already in use
				if ( maxItr-- > 0 ) {
					startDatabase(++port);
				} else {
					callback("couldn't find available port to bind to, range scanned %d-%d", args.db_port, args.db_port+MAX_PORT_ITR, null);
				}
			}
		});
		
		
		var started = 0;
		db_child.stdout.on('data', function(data) {
			if (started === 0 && /waiting for connections on port/.test(data.toString()) {
				// done here
				started = 1;
				callback(null, port);
			}
		});
	}

	startDatabase(args.db_port);
}


getDb(function(err, port) {

});
