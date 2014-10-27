(function() {
  angular.module('dnt.action.service', ['ui.router']).factory('ActionService', [
    '$rootScope', '$state', function($rootScope, $state) {
      var ActionService;
      return ActionService = (function() {
        ActionService.prototype.CODE = {
          TR_VALUE: "value",
          TOOLBAR_CSS: ".btn-toolbar"
        };

        ActionService.prototype.CSS = {
          WEIGHT: "weight",
          REJECT_CSS: "reject-css",
          REQUIRE_CSS: "require-css"
        };

        ActionService.prototype.INFO = {
          REJECT: "you must select {0} records to perform this action",
          REJECT_AT_LEAST: "you must select {0} records to perform this action at least",
          CHECK_STATUS: "you can't perform this action, please check the status of records which were selected"
        };


        /* @function constructor | construct function
            @param: options | {watch: {}, mapping: function}
         */

        function ActionService(options) {
          var fn, instance;
          this.options = options;
          instance = this;
          instance.options.buttons = [];
          fn = function() {
            return instance.options.watch;
          };
          $rootScope.$watchCollection(fn, function() {
            if (instance.options.buttons.length === 0) {
              instance.options.buttons = $(instance.CODE.TOOLBAR_CSS).find("button[" + instance.CSS.WEIGHT + "], a[" + instance.CSS.WEIGHT + "]");
            }
            return instance.toggleButtons();
          });
        }


        /* @function: toggleButtons | toggle the disabled attribute of buttons */

        ActionService.prototype.toggleButtons = function() {
          var button, conditions, selections, _i, _len, _ref, _results;
          selections = this.getSelections();
          _ref = this.options.buttons;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            button = _ref[_i];
            conditions = this.getConditions(button);
            _results.push(this.checkCondition(button, conditions, selections));
          }
          return _results;
        };


        /* @function: gotoState | redirect to another page
            @param: state | state of the page you want to redirect
         */

        ActionService.prototype.gotoState = function(state) {
          var selections;
          selections = this.getSelections();
          return $state.go(state, selections.datas[0]);
        };


        /* @function: perform | perform the callback function
            @param: callback | the function you want to perform
         */

        ActionService.prototype.perform = function(callback) {
          var item, selections, _i, _len, _ref, _results;
          selections = this.getSelections();
          if (callback.length === 1) {
            _ref = selections.datas;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              _results.push(callback(item));
            }
            return _results;
          } else {
            return callback.apply(this, selections.datas);
          }
        };


        /* @function: checkCondition | you can perform the action if the conditon is passed
            @param: element | button of toolbar
            @param: conditions | button attributes: weight, reject-css, require-css
            @param: selections | contains the selected datas and elements of tr
         */

        ActionService.prototype.checkCondition = function(element, conditions, selections) {
          if (/^\d+$/.test(conditions.weight)) {
            if (parseInt(conditions.weight) === selections.datas.length) {
              return this.checkStatus(element, conditions, selections);
            }
            return $(element).attr("disabled", "disabled");
          }
          if (/^\d+\+$/.test(conditions.weight)) {
            if (selections.datas.length >= parseInt(conditions.weight.split(/\+/)[0])) {
              return this.checkStatus(element, conditions, selections);
            }
            return $(element).attr("disabled", "disabled");
          }
          return $(element).removeAttr("disabled");
        };


        /* @function: checkStatus | used in isConditionPass function
            @param: element | button of toolbar
            @param: conditions | button attributes: weight, reject-css, require-css
            @param: selections | contains the selected datas and elements of tr
         */

        ActionService.prototype.checkStatus = function(element, conditions, selections) {
          if (this.isCssPass(conditions, selections)) {
            return $(element).removeAttr("disabled");
          } else {
            return $(element).attr("disabled", "disabled");
          }
        };


        /* @function: isCssPass | were css passed
            @param: conditions | button attributes: weight, reject-css, require-css
            @param: selections | contains the selected datas and elements of tr
            @return: true|false | true: passed; false: not pass
         */

        ActionService.prototype.isCssPass = function(conditions, selections) {
          var rejectCssJson, requireCssJson;
          rejectCssJson = this.getCss(conditions.rejectCss);
          requireCssJson = this.getCss(conditions.requireCss);
          if (this.isReject(rejectCssJson, selections.trs)) {
            return false;
          }
          return this.isRequire(requireCssJson, selections.trs);
        };


        /* @function: isReject | were reject-css passed
            @param: rejectCssJson | reject-css
            @param: trs | selected elements of tr
            @return: true|false | true: rejected; false: passed
         */

        ActionService.prototype.isReject = function(rejectCssJson, trs) {
          var rejectCss, tr, trCssJson, _i, _len;
          for (_i = 0, _len = trs.length; _i < _len; _i++) {
            tr = trs[_i];
            trCssJson = this.getClass(tr);
            for (rejectCss in rejectCssJson) {
              if (trCssJson[rejectCss] != null) {
                return true;
              }
            }
          }
          return false;
        };


        /* @function: isRequire | were require-css passed
            @param: requireCssJson | require-css
            @param: trs | selected elements of tr
            @return: true|false | true: passed; false: not pass
         */

        ActionService.prototype.isRequire = function(requireCssJson, trs) {
          var requireCss, tr, trCssJson, _i, _len;
          for (_i = 0, _len = trs.length; _i < _len; _i++) {
            tr = trs[_i];
            trCssJson = this.getClass(tr);
            for (requireCss in requireCssJson) {
              if (trCssJson[requireCss] == null) {
                return false;
              }
            }
          }
          return true;
        };


        /* @function: getConditions | get attributes of button: weight, reject-css, require-css
            @param: element | button of toolbar
            @return: conditions
         */

        ActionService.prototype.getConditions = function(element) {
          var conditions;
          conditions = {
            weight: $(element).attr(this.CSS.WEIGHT),
            rejectCss: $(element).attr(this.CSS.REJECT_CSS),
            requireCss: $(element).attr(this.CSS.REQUIRE_CSS)
          };
          return conditions;
        };


        /* @function: getSelections | get selected datas and elements of tr
            @return: selections
         */

        ActionService.prototype.getSelections = function() {
          var key, selections, val, _ref;
          selections = {
            datas: [],
            trs: []
          };
          _ref = this.options.watch;
          for (key in _ref) {
            val = _ref[key];
            if (!(val)) {
              continue;
            }
            selections.datas.push(this.options.mapping(key));
            selections.trs.push($("[" + this.CODE.TR_VALUE + "=" + key + "]"));
          }
          return selections;
        };


        /* @function: getCss | get css
            @param: classes | class of elements
            @return: json datas of css
         */

        ActionService.prototype.getCss = function(classes) {
          var css, cssJson, _i, _len, _ref;
          cssJson = {};
          if ((classes != null) && classes !== '') {
            _ref = classes.split(/\s+/);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              css = _ref[_i];
              cssJson[css] = css;
            }
          }
          return cssJson;
        };


        /* @function: getClass | get css of which selected elements of tr
            @param: tr | elements of tr
            @return: json datas of css
         */

        ActionService.prototype.getClass = function(tr) {
          return this.getCss($(tr).attr("class"));
        };


        /* @function: stringFormat | format the string
            @demo: stringFormat("i have {0} {1}", "two", "apples")
                   print: i have two apples
            @return: format string
         */

        ActionService.prototype.stringFormat = function() {
          var i, regx, string, val, _i, _len;
          if (arguments.length === 0) {
            return null;
          }
          string = arguments[0];
          for (i = _i = 0, _len = arguments.length; _i < _len; i = ++_i) {
            val = arguments[i];
            if (!(i !== 0)) {
              continue;
            }
            regx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            string = string.replace(regx, val);
          }
          return string;
        };


        /* @function: @make | instance a new ActionService
            @param: options | init params
            @return: instance of ActionService
         */

        ActionService.make = function(options) {
          return new ActionService(options);
        };

        return ActionService;

      })();
    }
  ]);

}).call(this);
