var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FbUserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    id: { type: String, required: true }
});

module.exports = mongoose.model('FbUser', FbUserSchema);