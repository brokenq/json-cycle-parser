(function() {
  angular.module("JsonCycleParser", []).factory("JsonCycleParser", [
    "$log", function($log) {
      var JsonCycleParser;
      return JsonCycleParser = (function() {
        function JsonCycleParser(json) {
          this.json = json;
          if (!this.isJson(this.json)) {
            return;
          }
          this.identify = "@id";
          this.identifyReg = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/;
          this.objMappings = {};
          this.redefineds = [];
          this.parseJson(this.json);
          this.definedGetters(this.redefineds);
        }

        JsonCycleParser.prototype.parseJson = function(json) {
          var identifyVal, key, val;
          if (!this.isJson(json)) {
            return;
          }
          identifyVal = null;
          for (key in json) {
            val = json[key];
            if (key === this.identify) {
              identifyVal = val;
              continue;
            }
            if (typeof val === "string") {
              if (!this.identifyReg.test(val)) {
                continue;
              }
              this.redefineds.push({
                "json": json,
                "field": key
              });
              continue;
            }
            if (val instanceof Array) {
              this.parseArray(val);
              continue;
            }
            if (val instanceof Object) {
              this.parseJson(val);
            }
          }
          if (identifyVal) {
            return this.objMappings[identifyVal] = json;
          }
        };

        JsonCycleParser.prototype.parseArray = function(array) {
          var val, _i, _len, _results;
          if (!array || array.length === 0) {
            return;
          }
          _results = [];
          for (_i = 0, _len = array.length; _i < _len; _i++) {
            val = array[_i];
            if (val instanceof Array) {
              this.parseArray(val);
              continue;
            }
            if (val instanceof Object) {
              _results.push(this.parseJson(val));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };

        JsonCycleParser.prototype.definedGetters = function(datas) {
          var data, _i, _len, _results;
          if (!datas || datas.length === 0) {
            return;
          }
          _results = [];
          for (_i = 0, _len = datas.length; _i < _len; _i++) {
            data = datas[_i];
            _results.push(this.definedGetter(data.json, data.field));
          }
          return _results;
        };

        JsonCycleParser.prototype.definedGetter = function(json, field) {
          var value;
          if (!this.isJson(json) || !field) {
            return;
          }
          value = json[field];
          if (this.identifyReg.test(value)) {
            value = this.objMappings[value];
          }
          return json.__defineGetter__(field, function() {
            return value;
          });
        };

        JsonCycleParser.prototype.isJson = function(json) {
          var error;
          if (!json) {
            return false;
          }
          try {
            JSON.stringify(json);
            return true;
          } catch (_error) {
            error = _error;
            return false;
          }
        };

        return JsonCycleParser;

      })();
    }
  ]);

}).call(this);
