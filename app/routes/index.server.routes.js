module.exports = function (app) {
    var index = require('../controllers/index.server.controller');
    var backwork = require('../controllers/backwork.server.controller');
    app.get('/', index.render);
    app.post('/', backwork.timefunction);
};
