var mongoose = require('mongoose');

var details = {
    avg: Number,
    variance: Number,
    stddev: Number
};

module.exports = mongoose.model('Stats', {
    githubStars: details,
    githubForks: details,
    githubWatchers: details,
    npmStars: details,
    npmDownloadsLastDay: details,
    npmDownloadsLastWeek: details,
    npmDependents: details
}, 'moduleStats');
