var Reactive = require('reactive');

var search = require('./search');
var tmpl = require('./index.html');

var Index = function() {
    if (!(this instanceof Index)) {
        return new Index();
    }

    var self = this;
    self.view = Reactive(tmpl, {}, {
        delegate: self
    });
    self.element = self.view.el;
};

Index.prototype.search = function(ev) {
    // trigger on 'focus()'
    if (ev.keyCode === 91) {
        return;
    }

    var self = this;
    self.view.set('pintop', true);

    var query = ev.target.value;
    if (query.length === 0) {
        return;
    }

    search(query, function(err, results) {
        self.view.set('results', results);
    });
};

Index.prototype.focus = function() {
    var self = this;
    self.element.querySelector('input').focus();
};

module.exports = Index;
