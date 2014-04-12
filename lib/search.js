var gaussian = require('gaussian')
var debug = require('debug')('browserify-search:search');

var Stats = require('../models/Stats');
var Modules = require('../models/Modules');

var g_stat = undefined;

Stats.findOne({ _id: 1 }, function(err, stat) {
    if (err) {
        return;
    }

    debug('loaded stats %j', stat);
    g_stat = stat;
});

module.exports = function(query, cb) {
    debug('query %s', query);

    if (!g_stat) {
        Stats.findOne(function(err, stat) {
            if (err) {
                return;
            }

            debug('loaded stats %j', stat);
            g_stat = stat;
        });
    }

    // max results
    var limit = 20;

    search(query, function(err, results) {
        if (err) {
            return cb(err);
        }

        results.forEach(function(result){
            result.awesomeness = awesomeness(result.obj, g_stat);
        })

        results.sort(function(one, other){
            var oneScore = one.score * one.awesomeness
            var otherScore = other.score * other.awesomeness
            return otherScore - oneScore
        })

        results = results.slice(0, limit);

        cb(null, results.map(function(result) {
            var score = result.score;
            var module = result.obj;

            return {
                score: score,
                name: module.name,
                user: module.user,
                description: module.description,
                githubStars: module.githubStars,
                githubWatchers: module.githubWatcher,
                npmStars: module.npmStars,
                npmDownloadsLastDay: module.npmDownloadsLastDay,
                npmDownloadsLastWeek: module.npmDownloadsLastWeek,
                npmDependents: module.npmDependents
            }
        }));
    });
};

function awesomeness(module, stats) {
    if (!stats) {
        return 1;
    }

    var ingredients = [
        ['githubStars', 1],
        ['githubForks', 1],
        ['githubWatchers', 1],
        ['npmStars', 1],
        ['npmDownloadsLastDay', 1],
        ['npmDownloadsLastWeek', 1],
        ['npmDependents', 1]
    ];
    var sum = 0
    var sumWeights = 0
    for (var i = 0; i < ingredients.length; ++i){
        var prop = ingredients[i][0]
        var weight = ingredients[i][1]
        sum += cdf(prop, module, stats) * weight
        sumWeights += weight
    }
    var ret = sum / sumWeights;
    if (isNaN(ret)) {
        return 0;
    }
    return ret
}

function cdf(prop, module, stats){
    var dist = gaussian(stats[prop].avg, stats[prop].variance)
    return dist.cdf(module[prop])
}

function search(query, cb) {
    var cmd = {
        text: 'modules',
        search: query,
        limit: 200
    };

    Modules.db.db.command(cmd, function(err, data) {
        if (err) {
            return cb(err);
        }
        cb(null, data.results);
    });
}
