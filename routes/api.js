'use strict';

const async = require('async');
const pretty = require('prettysize');
const services = require(__base + 'services/services.js');
const config = require(__base + 'config.js')

const getRoute = function(route) {
  return '/api' + route;
}

module.exports = function(app) {
  // Home page
  app.get(getRoute('/stats/get/json'), function(req, res) {
    let returnObj = {};

    async.parallel({
      // Days left in the current billing cycle
      daysLeft: function(callback) {
        return callback(null, services.pfsense.getDaysLeftMonth());
      },
      //
      currentMonthUsage: function(callback) {
        services.pfsense.getCurrentMonthUsage(function(err, monthUsage) {
          if (err) {
            console.error(err);
            return callback(null, null);
          }

          return callback(null, {bytes: monthUsage, text: pretty(monthUsage, false, false, 3)});
        });
      },
      //
      currentDayUsage: function(callback) {
        services.pfsense.getTodayUsageBytes(function(err, todayUsage) {
          if (err) {
            console.error(err);
            return callback(null, null);
          }

          return callback(null, {bytes: todayUsage, text: pretty(todayUsage, false, false, 3)});
        });
      },
      //
      currentMonthQuotaLeft: function(callback) {
        services.pfsense.getMonthQuotaLeft(function(err, bytesLeft) {
          if (err) {
            console.error(err);
            return callback(null, null);
          }

          return callback(null, {bytes: bytesLeft, text: pretty(bytesLeft, false, false, 3)});
        });
      },
      //
      currentDayQuota: function(callback) {
        services.pfsense.getTodayQuota(function(err, bytesLeft) {
          if (err) {
            console.error(err);
            return callback(null, null);
          }

          return callback(null, {bytes: bytesLeft, text: pretty(bytesLeft, false, false, 3)});
        });
      },
      //
      currentDayQuotaLeft: function(callback) {
        services.pfsense.getTodayQuotaLeft(function(err, bytesLeft) {
          if (err) {
            console.error(err);
            return callback(null, null);
          }

          return callback(null, {bytes: bytesLeft, text: pretty(bytesLeft, false, false, 3)});
        });
      },
      //
      monthQuota: function(callback) {
        let bytesDataCap = config.datacap * Math.pow(1024, 3);

        return callback(null, {bytes: bytesDataCap, text: pretty(bytesDataCap, false, false, 0)});
      },

    }, function(err, results) {
      if (err) return res.sendStatus(500);

      let returnObj = {};

      async.forEachOf(results, function (value, key, callback) {
        // Check if the value is null
        if (value != null) {
          returnObj[key] = value;
          return callback();
        }

        return callback();
      }, function (err) {
        if (err) return console.error(err.message);

        res.json(returnObj);
      });
    });
  });
};
