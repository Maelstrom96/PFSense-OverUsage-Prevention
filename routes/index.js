'use strict';

var apiRoutes = require('./api.js');

module.exports = function(app) {
  // Setup API Routes
  apiRoutes(app);

  // Home page
  app.get('/', function(req, res) {
    res.render('pages/index', { title: 'Index' });
  });
};
