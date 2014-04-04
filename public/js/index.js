var Reactive = require('reactive');

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

Index.prototype.search = function() {
    var self = this;
    self.view.set('pintop', true);

    // sample results
    var results = [
        { name: 'reactive', description: 'foobar' },
        { name: 'xtend', description: 'foobaz' },
    ];
    self.view.set('results', results);

    // api call to search after N characters typed
    // throttle
};

module.exports = Index;
