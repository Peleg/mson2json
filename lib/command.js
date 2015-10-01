(function (mson2json, fs) {

    'use strict';

    function loadMson(path, cb) {
        fs.readFile(path, function (err, data) {
            if (err) throw err;
            return cb(data.toString());
        });
    }

    module.exports = function run(path, cb) {
        return loadMson(path, function (msonData) {
            mson2json(msonData, cb)
        })
    };
})(
    require('./mson2json'),
    require('fs')
)