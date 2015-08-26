(function (Drafter, bpCompiler, fs) {

    'use strict';

    function loadMson(path, cb) {
        fs.readFile(path, function(err, data) {
            if (err) throw err;
            return cb(data.toString());
        });
    }

    function parseBluprint(data, cb) {
        var drafter = new Drafter;
        drafter.make(data, function (err, result) {
            if (err) throw err;
            return cb(bpCompiler.compile(result.ast).transactions);
        });
    }

    function convertToJson(transactionData, cb) {
        var output = "# " + transactionData[0].origin.apiName;
        output += transactionData.map(buildJsonTransaction).join('');
        return cb(output);
    }

    function buildJsonTransaction(t) {
        return [
            "\n\n",
            "##" + t.origin.resourceName + " [" + t.origin.uriTemplate + "]",
            "\n\n",
            "###" + t.origin.actionName + " [" + t.request.method + "]",
            "\n\n",
            "+ Request (application/json)",
            t.request.body ? "\n\n    + Body\n\n        " +  t.request.body : "",
            "\n\n",
            "+ Response " + t.response.status + (t.response.headers['Content-Type'] ? " (" + t.response.headers['Content-Type'].value + ")" : ""),
            "\n\n",
            "    " + t.response.body,
        ].join('');
    }

    /**
     * path - path to MSON blueprint
     * cb   - function(json)
     */
    module.exports = function main(path, cb) {
        return loadMson(path, function (msonData) {
            parseBluprint(msonData, function (parsedData) {
                convertToJson(parsedData, cb);
            });
        });
    };

})(
    require('drafter'),
    require('blueprint-transactions'),
    require('fs')
);