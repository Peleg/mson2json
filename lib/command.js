'use strict';

var mson2json = require('./mson2json');
var fs        = require('fs');
var path      = require('path')

module.exports = (function() {
    function M2jCommand(options, cb) {
        options || (options = {});

        this.inputPath = options.argv[0];
        if (!this.inputPath) throw new Error('Must provide path to MSON file!');

        this.outputPath = options.argv[1] || path.basename(this.inputPath) + '_json.md';
    }

    M2jCommand.prototype.load = function (cb) {
        fs.readFile(this.inputPath, function (err, data) {
            if (err) throw err;
            return cb(data.toString());
        });
    };

    M2jCommand.prototype.write = function(json) {
        fs.writeFile(this.outputPath, json, function (err) {
            if (err) throw err;
            process.exit();
        });
    };

    M2jCommand.prototype.run = function() {
        var self = this;
        self.load(function(mson) {
            mson2json(mson, function(json) {
                self.write(json);
            });
        });
    };

    return M2jCommand;
})();