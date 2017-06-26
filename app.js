global.__base = __dirname + '/';

var config = require('./config.js');
var express = require('express');
var pretty = require('prettysize');
var services = require('./services/services.js')
var routes = require('./routes/index.js');
var app = express();

var checkTimeout;

// this function is called at a interval to check if we went over usage
const check = function() {
	services.pfsense.getCurrentMonthUsage(function(err, monthUsage) {
		console.log('Number of days left: ' + services.pfsense.getDaysLeftMonth());
		console.log('This Month Usage: ' + pretty(monthUsage, false, false, 3));
		services.pfsense.getTodayUsageBytes(function(err, todayUsage) {
			console.log('Today Usage: ' + pretty(todayUsage, false, false, 3));
			services.pfsense.getMonthQuotaLeft(function(err, bytesLeft) {
				console.log('Monthly Quota left: ' + pretty(bytesLeft, false, false, 3));
				services.pfsense.getTodayQuota(function(err, bytesLeft) {
					console.log('Allowed quota today: ' + pretty(bytesLeft, false, false, 3));
					services.pfsense.getTodayQuotaLeft(function(err, bytesLeft) {
						console.log('Allowed quota left: ' + pretty(bytesLeft, false, false, 3));

						if (bytesLeft <= 0) {
							services.pfsense.checkRuleStatus(config.pfsense.blockRuleId, function(err, enabled){
								if (!enabled) {
									console.log('Enabling the block rule');
									services.pfsense.toggleFirewallRule(config.pfsense.blockRuleId, function(err) {
										if (err) return console.log(err);

										services.pfsense.applyFirewallRule(function(err){
											if (err) return console.log(err);

											console.log('Successfully enabled the block rule');;
										});
									});
								}
							});
						}
						else {
							services.pfsense.checkRuleStatus(config.pfsense.blockRuleId, function(err, enabled){
								if (enabled) {
									console.log('Disabling the block rule');
									services.pfsense.toggleFirewallRule(config.pfsense.blockRuleId, function(err) {
										if (err) return console.log(err);

										services.pfsense.applyFirewallRule(function(err){
											if (err) return console.log(err);

											console.log('Successfully disabled the block rule');;
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

//---------- Web Server code block ----------

// set the view engine to ejs
app.set('view engine', 'ejs');

// Setup routes
routes(app);

app.listen(config.webserver.port, function () {
  console.log('Webserver listening on port ' + config.webserver.port + '.');
});

// Starting point
run();
