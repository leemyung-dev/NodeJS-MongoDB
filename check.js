const exec = require('child_process').exec;
const config = require('./config');

const check = function () {
	var last = exec('lsof -i:' + config.port);
	last.on('exit', function (code) {
		if (code != '0') {
			console.log('主服务已经关闭， 正在重启。。。');
			run();
		} else {
			console.log('主服务正常运行中');
		}
	});

	setTimeout(check, 5000);
}

const run = function () {
	var last = exec('node mongo.js');
	last.on('exit', function(code) {
		if (code == '0') {
			console.log('主服务已重启成功');
		} else {
			console.log('主服务重启失败');
		}
	});
}

check();