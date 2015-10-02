(function (Drafter, bpCompiler, Transaction) {

    'use strict';

    function parseBluprint(data, cb) {
        var drafter = new Drafter;
        drafter.make(data, function (err, result) {
            if (err) throw err;

            // get all url template params in an object for easy key-based retrieval
            var params = result.ast.resourceGroups.reduce(function (params, rg) {
                rg.resources.forEach(function (t) {
                    params[rg.name + t.name + t.uriTemplate] = t.parameters;
                });
                return params;
            }, {});

            var transactions =
                bpCompiler.compile(result.ast).transactions.map(function (t) {
                    var key = t.origin.resourceGroupName +
                        t.origin.resourceName +
                        t.origin.uriTemplate;

                    t.origin.parameters = params[key];

                    return t;
                });

            return cb(transactions);
        });
    }

    function convertToJson(transactions, cb) {
        var resourceHead, resourceGroup;
        if (transactions.length === 0) return;

        var output = "# " + transactions[0].origin.apiName + "\n\n";

        transactions.forEach(function (t) {
            t = new Transaction(t);

            // only append resource declartion and params when we've switched to
            // a new one.
            output += resourceGroup === t.groupName
                ? ''
                : '# Group ' + (resourceGroup = t.groupName) + "\n\n";

            output += resourceHead === t.resourceHead()
                ? ''
                : (resourceHead = t.resourceHead()) + "\n\n";

            output += t.body() + "\n\n";
        });

        return cb(output);
    }

    /**
     * msonData - mson data from anywhere
     * cb   - function (JSON data)
     */
    module.exports = function main(msonData, cb) {
        return parseBluprint(msonData, function (parsedData) {
            convertToJson(parsedData, cb);
        });
    };

})(
    require('drafter'),
    require('blueprint-transactions'),
    require('./transaction')
);