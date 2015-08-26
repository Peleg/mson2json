(function () {

    'use strict';

    module.exports = Transaction;

    function Transaction(t) {
        this.resourceName    = t.origin.resourceName;
        this.uriTemplate     = t.origin.uriTemplate;
        this.actionName      = t.origin.actionName;
        this.params          = t.origin.parameters || [];

        this.requestMethod   = t.request.method;
        this.requestHeaders  = t.request.headers;
        this.requestBody     = t.request.body;

        this.responseStatus  = t.response.status;
        this.responseHeaders = t.response.headers;
        this.responseBody    = t.response.body;
    }

    Transaction.prototype.resourceTitle = function () {
        return "## " + this.resourceName + " [" + this.uriTemplate + "]";
    };

    Transaction.prototype.parameters = function () {
        return this.params.reduce(function (carry, param) {
            return carry + "\n    + " + param.name +
                " (" + (param.required ? 'required' : 'optional') +
                ', ' + param.type + ', `' + param.example + "`)";
        }, this.params.length && "+ Parameters");
    };

    Transaction.prototype.transactionTitle = function () {
        return "### " + this.actionName + " [" + this.requestMethod + "]";
    };

    Transaction.prototype.requestTitle = function (contentType) {
        contentType = this.requestHeaders['Content-Type'] &&
            this.requestHeaders['Content-Type'].value;

        return "+ Request (" + (contentType || 'application/json') + ")";
    };

    Transaction.prototype.requestHeaderString = function (headerKeys) {
        headerKeys = Object.keys(this.requestHeaders)
            .filter(function (key) {
                return key !== 'Content-Type';
            });

        return headerKeys.reduce((function(prev, cur) {
            return prev + "\n            " + cur + ': ' +
                this.requestHeaders[cur].value;
        }).bind(this), headerKeys.length && "    + Headers\n");
    };

    Transaction.prototype.requestBodyString = function () {
        try {
            this.requestBody = JSON.stringify(JSON.parse(this.requestBody));
        } catch (e) {
            this.requestBody = '{}';
        }
        return this.requestBody && ("    + Body\n\n            " + this.requestBody);
    };

    Transaction.prototype.responseTitle = function (contentType) {
        contentType = this.responseHeaders['Content-Type']
            ? " (" + this.responseHeaders['Content-Type'].value + ")"
            : "";

        return "+ Response " + this.responseStatus + contentType;
    };

    Transaction.prototype.responseBodyString = function () {
        return this.responseBody &&
            "        " + JSON.stringify(JSON.parse(this.responseBody));
    };

    Transaction.prototype.resourceHead = function () {
        return  [
            this.resourceTitle(),
            this.parameters()
        ].filter(function (val) {
            return val;
        }).join("\n\n");
    };

    Transaction.prototype.body = function () {
        return [
            this.transactionTitle(),
            this.requestTitle(),
            this.requestHeaderString(),
            this.requestBodyString(),
            this.responseTitle(),
            this.responseBodyString()
        ].filter(function (val) {
            return val;
        }).join("\n\n");
    };

})();
