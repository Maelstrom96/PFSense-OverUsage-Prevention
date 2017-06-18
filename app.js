var config = require('./config.js');
var pretty = require('prettysize');
var https = require('https');
var querystring = require('querystring');

var checkTimeout;

const getCSRFToken = function(callback) {
	let body = "";
	
	let options = {
	  host: config.pfsense.host,
	  port: config.pfsense.port,
	  path: '/diag_backup.php',
	  method: 'GET',
	  rejectUnauthorized: false,
	  headers: {
		accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		"Accept-Language": 'en-US,en;q=0.8,fr-CA;q=0.6,fr;q=0.4',
		Connection: 'keep-alive',
		Host: config.pfsense.host,
		Cookie: 'lang=en; PHPSESSID=' + config.pfsense.PHPSESSID + '; user=' + config.pfsense.username,
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
	  }
	};
	
	// Making the https get call
    let getReq = https.request(options, function(res) {
        res.on('data', function(data) {
			body += data;
        });
		
		res.on('end', function() {
			//console.log(body);
			let searchString = 'var csrfMagicToken = "';
			let indexStart = body.indexOf(searchString) + searchString.length;
			//console.log(indexStart);
			let indexEnd = body.indexOf('";', indexStart);
			
			let csrfString = body.substring(indexStart, indexEnd);
			//console.log(csrfString);
			
			return callback(null, csrfString);
        });
    });
	
	// End the request
    getReq.end();
    getReq.on('error', function(err){
        return callback(err);
    }); 
}

// true = enabled
// false = disabled
const checkRuleStatus = function(ruleid, callback) {
	let body = "";
	
	let options = {
	  host: config.pfsense.host,
	  port: config.pfsense.port,
	  path: '/firewall_rules.php?if=lan',
	  method: 'GET',
	  rejectUnauthorized: false,
	  headers: {
		accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		"Accept-Language": 'en-US,en;q=0.8,fr-CA;q=0.6,fr;q=0.4',
		Connection: 'keep-alive',
		Host: config.pfsense.host,
		Cookie: 'lang=en; PHPSESSID=' + config.pfsense.PHPSESSID + '; user=' + config.pfsense.username,
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
	  }
	};
	
	// Making the https get call
    let getReq = https.request(options, function(res) {
        res.on('data', function(data) {
			body += data;
        });
		
		res.on('end', function() {
			//console.log(body);
			let searchString = "document.location='firewall_rules_edit.php?id=" + ruleid +"'";
			let indexStart = body.indexOf(searchString) + searchString.length;
			
			let string = body.substring(indexStart, indexStart + 20);
			
			let ruleEnabled = false;
			let index = string.indexOf('disabled');
			if (index === -1) ruleEnabled = true;
			return callback(null, ruleEnabled);
        });
    });
	
	// End the request
    getReq.end();
    getReq.on('error', function(err){
        return callback(err);
    }); 	
}

const applyFirewallRule = function(callback) {
	getCSRFToken(function(err, csrfToken) {
		let body = '';
		
		let post_data = querystring.stringify({
		  '__csrf_magic': csrfToken,
		  'apply': 'Apply Changes',
		});
		
		let options = {
		  host: config.pfsense.host,
		  port: config.pfsense.port,
		  path: config.pfsense.rules.apply.path,
		  method: 'POST',
		  rejectUnauthorized: false,
		  form: {'__csrf_magic': csrfToken, 'apply': 'Apply Changes'},
		  headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.8,fr-CA;q=0.6,fr;q=0.4',
			'Cache-Control': 'max-age=0',
			Connection: 'keep-alive',
			'Content-Type': 'application/x-www-form-urlencoded',
			Cookie: 'lang=en; user=' + config.pfsense.username + '; PHPSESSID=' + config.pfsense.PHPSESSID + '; session=',
			Host: config.pfsense.host,
			Origin: 'https://192.168.2.1',
			Referer: 'https://192.168.2.1/firewall_rules.php?if=lan',
			'Upgrade-Insecure-Requests': 1,
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
		  }
		};
		
		// Making the https post call
		let postReq = https.request(options, function(res) {
			res.on('data', function(data) {
				body += data;
			});
			
			res.on('end', function() {
				return callback(null);
			});
		});
		
		postReq.write(post_data);
		// End the request
		postReq.end();
		postReq.on('error', function(err){
			return callback(err);
		}); 
	});
}

const toggleFirewallRule = function(ruleId, callback) {
	let togglePath = config.pfsense.rules.toggle.path;
	togglePath = togglePath.replace('{id}', ruleId);
	
	let options = {
	  host: config.pfsense.host,
	  port: config.pfsense.port,
	  path: togglePath,
	  method: 'GET',
	  rejectUnauthorized: false,
	  headers: {
		accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		"Accept-Language": 'en-US,en;q=0.8,fr-CA;q=0.6,fr;q=0.4',
		Connection: 'keep-alive',
		Host: config.pfsense.host,
		Cookie: 'lang=en; PHPSESSID=' + config.pfsense.PHPSESSID + '; user=' + config.pfsense.username,
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
	  }
	};
	
	// Making the https get call
    let getReq = https.request(options, function(res) {
        res.on('data', function(data) {

        });
		
		res.on('end', function() {
			return callback(null);
        });
    });
	
	// End the request
    getReq.end();
    getReq.on('error', function(err){
        return callback(err);
    }); 
}

const getMonthQuotaBytes = function() {
	return config.datacap * 1024 * 1024 * 1024;
}

const getDaysInMonth = function(month,year) {
	// Here January is 1 based
	//Day 0 is the last day in the previous month
	//return new Date(year, month, 0).getDate();
	// Here January is 0 based
	return new Date(year, month+1, 0).getDate();
};

const getTodayQuota = function(callback) {
	getMonthQuotaLeft(function(err, monthBytesLeft) {
		if (err) return callback(err);
		getTodayUsageBytes(function(err, todayBytes) {
			if (err) return callback(err);
			
			// This is the Quota that was remaining at 00:00 today
			let quotaLeft = monthBytesLeft + todayBytes;
			
			let averageQuotaLeft = quotaLeft / getDaysLeftMonth();
			
			return callback(null, averageQuotaLeft);
		});
	});
}

const getTodayQuotaLeft = function(callback) {
	getTodayQuota(function(err, todayQuotaBytes) {
		if (err) return callback(err);
		getTodayUsageBytes(function(err, todayBytes) {
			if (err) return callback(err);
			
			let todayQuotaLeftBytes = todayQuotaBytes - todayBytes;
			
			return callback(null, todayQuotaLeftBytes);
		});
	});
}

// Return current month quota left in Bytes
const getMonthQuotaLeft = function(callback) {
	getCurrentMonthUsage(function(err, monthUsage) {
		if (err) return callback(err);
		
		let currentMonthBytes = monthUsage * 1024;
		return callback(null, getMonthQuotaBytes() - currentMonthBytes);
	});
}

const getDaysLeftMonth = function() {
	let today = new Date();
	let daysInCurrentMonth = getDaysInMonth(today.getMonth(), today.getYear());
	return (daysInCurrentMonth - today.getDate()) + 1;
}

const getNetworkUsageStats = function(callback) {
	var options = {
	  host: config.pfsense.host,
	  port: config.pfsense.port,
	  path: config.pfsense.vnstat.path,
	  method: 'GET',
	  rejectUnauthorized: false,
	  headers: {
		accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		"Accept-Language": 'en-US,en;q=0.8,fr-CA;q=0.6,fr;q=0.4',
		Connection: 'keep-alive',
		Host: config.pfsense.host,
		Cookie: 'lang=en; PHPSESSID=' + config.pfsense.PHPSESSID + '; user=' + config.pfsense.username,
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
	  }
	};
	
	// Making the https get call
    let getReq = https.request(options, function(res) {
		let body = '';
		let reply = {
			statusCode: res.statusCode
		}

        res.on('data', function(data) {
			body += data;
        });
		
		res.on('end', function() {
			try {
				reply.data = JSON.parse(body)
			} catch(exception) {
				return callback(exception);
			}
			return callback(null, reply);
        });
    });
	
	// End the request
    getReq.end();
    getReq.on('error', function(err){
        return callback(err);
    }); 
}

const getCurrentMonthUsage = function(callback) {
	getNetworkUsageStats(function(err, reply) {
		if (err) return callback(err);

		let currentMonthBits = reply.data.interfaces[0].traffic.months[0].rx;
		currentMonthBits += reply.data.interfaces[0].traffic.months[0].tx;
		
		return callback(null, currentMonthBits);
	}); 
}

const getTodayUsageBytes = function(callback) {
	getNetworkUsageStats(function(err, reply) {
		if (err) return callback(err);

		let todayBytes = reply.data.interfaces[0].traffic.days[0].rx;
		todayBytes += reply.data.interfaces[0].traffic.days[0].tx;
		
		return callback(null, todayBytes * 1024);
	}); 
}

// this function is called at a interval to check if we went over usage
const check = function() {
	getCurrentMonthUsage(function(err, monthUsage) {
		console.log('Number of days left: ' + getDaysLeftMonth());
		console.log('This Month Usage: ' + pretty(monthUsage * 1024, false, false, 3));
		getTodayUsageBytes(function(err, todayUsage) {
			console.log('Today Usage: ' + pretty(todayUsage, false, false, 3));
			getMonthQuotaLeft(function(err, bytesLeft) {
				console.log('Monthly Quota left: ' + pretty(bytesLeft, false, false, 3));
				getTodayQuota(function(err, bytesLeft) {
					console.log('Allowed quota today: ' + pretty(bytesLeft, false, false, 3));
					getTodayQuotaLeft(function(err, bytesLeft) {
						console.log('Allowed quota left: ' + pretty(bytesLeft, false, false, 3));
						
						if (bytesLeft <= 0) {
							checkRuleStatus(config.pfsense.blockRuleId, function(err, enabled){
								if (!enabled) {
									console.log('Enabling the block rule');
									toggleFirewallRule(config.pfsense.blockRuleId, function(err) {
										if (err) return console.log(err);
										
										applyFirewallRule(function(err){
											if (err) return console.log(err);
											
											console.log('Successfully enabled the block rule');;
										});
									});
								}
							});
						}
						else {
							checkRuleStatus(config.pfsense.blockRuleId, function(err, enabled){
								if (enabled) {
									console.log('Disabling the block rule');
									toggleFirewallRule(config.pfsense.blockRuleId, function(err) {
										if (err) return console.log(err);
										
										applyFirewallRule(function(err){
											if (err) return console.log(err);
											
											console.log('Successfully enabled the block rule');;
										});
									});
								}
							});
						}
					});
				});
			});
		});
	});
	
	// Loop the timer
	checkTimeout = setTimeout(check, config.checkInterval); // Call the check function at the defined rate
}

// Starting Function
const run = function() {
	check(); // Call the function immediately 
}

// Starting point
run();