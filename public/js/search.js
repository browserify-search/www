var ajax = require('superagent');

module.exports = function(query, cb) {
    var qs = {
        q: query
    };

    ajax
    .get('/api/search')
    .query(qs)
    .end(function(err, res) {
        if (err) {
            return cb(err);
        }

        if (res.status !== 200) {
            return cb(new Error(res.body.message || 'oops!'));
        }

        var results = res.body;
        cb(null, results);
    });
};
