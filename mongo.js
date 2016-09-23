const config = require('./config');
const api = require('./api');
const messages = require('./messages');
const MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

const insertDocument = function(query) {

var mongo = 'mongodb://' + config.mongo_hostname + ':' + config.mongo_port + '/' + query.database;

MongoClient.connect(mongo, function(err, db) {
  assert.equal(null, err);

  db.collection(query.collection).insertOne(JSON.parse(query.log)[0], function(err, r) {
    assert.equal(null, err);
    assert.equal(1, r.insertedCount);
	db.close();
  });
});

}

const http = require('http');
const url = require('url');
const qs = require('querystring');
const hostname = config.hostname;
const port = config.port;

const auth = function (query, res) {

	if (!query.module || !api.hasOwnProperty(query.module)) {
		return err_basic('102', res);
	}
	if (!query.clientID) {
		return err_basic('100', res);
	}
	if (!query.passwd) {
		return err_basic('101', res);
	}
	if (query.clientID != api[query.module].clientID || query.passwd != api[query.module].passwd) {
		return err_basic('103', res);
	}

	return true;
}

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');
	//res.end('Hello World\n');
	
	if (req.method.toUpperCase() == 'POST') {
		var postData = "";

		req.on("data", function (data) {
			postData += data;
		});

		req.on("end", function () {
			var query = qs.parse(postData);
			
			if(auth(query, res)) {
				insertDocument(query);
				res.end(JSON.stringify(query));
			}
		});
	}
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const err_basic = function (code, res) {
	res.end(
		JSON.stringify({
			status: false,
			data: code,
			message: messages[code]
		})
	);
	return false;
}