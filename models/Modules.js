var mongoose = require('mongoose');

module.exports = mongoose.model('Module', {
    name: String,
    description: String,
    user: String
    //searchText: String
}, 'modules');
