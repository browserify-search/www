var Reactive = require('reactive');

var search = require('./search');
var tmpl = require('./index.html');

var Index = function(page) {
    if (!(this instanceof Index)) {
        return new Index(page);
    }

    var self = this;
    self.page = page;
    self.view = Reactive(tmpl, {}, {
        delegate: self
    });
    self.element = self.view.el;
    self.searchBox = self.element.querySelector('input');
};

Index.prototype.submit = function(ev) {
    var query = this.searchBox.value;
    this.page.show('/' + escape(query));
};

Index.prototype.search = function(query) {
    var self = this;
    self.view.set('pintop', true);

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
