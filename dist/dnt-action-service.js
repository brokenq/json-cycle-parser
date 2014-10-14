(function() {
  angular.module('dnt.action.service', ['ui.router']).factory('ActionService', [
    '$rootScope', '$state', function($rootScope, $state) {
      var ActionService;
      return ActionService = (function() {
        ActionService.prototype.CODE = {
          TR_VALUE: "value"
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

        function ActionService(options) {
          this.options = options;
        }


        /* @function: passedSelections | deal with the conditions before perform the action
            @param: event | event
            @return: the selected datas
         */

        ActionService.prototype.passedSelections = function(event) {
          var conditions, selections;
          conditions = this.getConditions(event);
          selections = this.getSelections();
          this.checkConditionPass(conditions, selections);
          return selections.datas;
        };


        /* @function: gotoState | redirect to another page
            @param: state | state of the page you want to redirect
            @param: event | event
         */

        ActionService.prototype.gotoState = function(state, event) {
          var error, passed;
          try {
            passed = this.passedSelections(event);
            return $state.go(state, passed[0]);
          } catch (_error) {
            error = _error;
            return alert(error);
          }
        };


        /* @function: perform | perform the callback function
            @param: callback | the function you want to perform
            @param: event | event
         */

        ActionService.prototype.perform = function(callback, event) {
          var error, item, passed, _i, _len, _results;
          try {
            passed = this.passedSelections(event);
            if (callback.length === 1) {
              _results = [];
              for (_i = 0, _len = passed.length; _i < _len; _i++) {
                item = passed[_i];
                _results.push(callback(item));
              }
              return _results;
            } else {
              return callback.apply(this, passed);
            }
          } catch (_error) {
            error = _error;
            return alert(error);
          }
        };


        /* @function: isConditionPass | you can perform the action if the conditon is passed
            @param: conditions | button attributes: weight, reject-css, require-css
            @param: selections | contains the selected datas and elements of tr
         */

        ActionService.prototype.checkConditionPass = function(conditions, selections) {
          var min, weight;
          if (/^\d+$/.test(conditions.weight)) {
            weight = parseInt(conditions.weight);
            if (weight === selections.datas.length) {
              this.checkStatus(conditions, selections);
              return;
            }
            throw this.stringFormat(this.INFO.REJECT, weight);
          }
          if (/^\d+\+$/.test(conditions.weight)) {
            min = parseInt(conditions.weight.split(/\+/)[0]);
            if (selections.datas.length >= min) {
              this.checkStatus(conditions, selections);
              return;
            }
            throw this.stringFormat(this.INFO.REJECT_AT_LEAST, min);
          }
        };


        /* @function: checkStatus | used in isConditionPass function
            @param: conditions | button attributes: weight, reject-css, require-css
            @param: selections | contains the selected datas and elements of tr
         */

        ActionService.prototype.checkStatus = function(conditions, selections) {
          if (!this.isCssPass(conditions, selections)) {
            throw this.INFO.CHECK_STATUS;
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


        /* @function: getConditions | get button attributes: weight, reject-css, require-css
            @param: event | event-css
            @return: conditions
         */

        ActionService.prototype.getConditions = function(event) {
          var conditions, element;
          element = $(event.srcElement);
          conditions = {
            weight: element.attr(this.CSS.WEIGHT),
            rejectCss: element.attr(this.CSS.REJECT_CSS),
            requireCss: element.attr(this.CSS.REQUIRE_CSS)
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
          if (classes != null) {
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
;/*! dnt-action-service 14-10-2014 */
(function(){angular.module("dnt.action.service",["ui.router"]).factory("ActionService",["$rootScope","$state",function(a,b){var c;return c=function(){function a(a){this.options=a}return a.prototype.CODE={TR_VALUE:"value"},a.prototype.CSS={WEIGHT:"weight",REJECT_CSS:"reject-css",REQUIRE_CSS:"require-css"},a.prototype.INFO={REJECT:"you must select {0} records to perform this action",REJECT_AT_LEAST:"you must select {0} records to perform this action at least",CHECK_STATUS:"you can't perform this action, please check the status of records which were selected"},a.prototype.passedSelections=function(a){var b,c;return b=this.getConditions(a),c=this.getSelections(),this.checkConditionPass(b,c),c.datas},a.prototype.gotoState=function(a,c){var d,e;try{return e=this.passedSelections(c),b.go(a,e[0])}catch(f){return d=f,alert(d)}},a.prototype.perform=function(a,b){var c,d,e,f,g,h;try{if(e=this.passedSelections(b),1===a.length){for(h=[],f=0,g=e.length;g>f;f++)d=e[f],h.push(a(d));return h}return a.apply(this,e)}catch(i){return c=i,alert(c)}},a.prototype.checkConditionPass=function(a,b){var c,d;if(/^\d+$/.test(a.weight)){if(d=parseInt(a.weight),d===b.datas.length)return void this.checkStatus(a,b);throw this.stringFormat(this.INFO.REJECT,d)}if(/^\d+\+$/.test(a.weight)){if(c=parseInt(a.weight.split(/\+/)[0]),b.datas.length>=c)return void this.checkStatus(a,b);throw this.stringFormat(this.INFO.REJECT_AT_LEAST,c)}},a.prototype.checkStatus=function(a,b){if(!this.isCssPass(a,b))throw this.INFO.CHECK_STATUS},a.prototype.isCssPass=function(a,b){var c,d;return c=this.getCss(a.rejectCss),d=this.getCss(a.requireCss),this.isReject(c,b.trs)?!1:this.isRequire(d,b.trs)},a.prototype.isReject=function(a,b){var c,d,e,f,g;for(f=0,g=b.length;g>f;f++){d=b[f],e=this.getClass(d);for(c in a)if(null!=e[c])return!0}return!1},a.prototype.isRequire=function(a,b){var c,d,e,f,g;for(f=0,g=b.length;g>f;f++){d=b[f],e=this.getClass(d);for(c in a)if(null==e[c])return!1}return!0},a.prototype.getConditions=function(a){var b,c;return c=$(a.srcElement),b={weight:c.attr(this.CSS.WEIGHT),rejectCss:c.attr(this.CSS.REJECT_CSS),requireCss:c.attr(this.CSS.REQUIRE_CSS)}},a.prototype.getSelections=function(){var a,b,c,d;b={datas:[],trs:[]},d=this.options.watch.items;for(a in d)c=d[a],c&&(b.datas.push(this.options.mapping(a)),b.trs.push($("["+this.CODE.TR_VALUE+"="+a+"]")));return b},a.prototype.getCss=function(a){var b,c,d,e,f;if(c={},null!=a)for(f=a.split(/\s+/),d=0,e=f.length;e>d;d++)b=f[d],c[b]=b;return c},a.prototype.getClass=function(a){return this.getCss($(a).attr("class"))},a.prototype.stringFormat=function(){var a,b,c,d,e,f;if(0===arguments.length)return null;for(c=arguments[0],a=e=0,f=arguments.length;f>e;a=++e)d=arguments[a],0!==a&&(b=new RegExp("\\{"+(a-1)+"\\}","gm"),c=c.replace(b,d));return c},a.make=function(b){return new a(b)},a}()}])}).call(this),function(){angular.module("dnt.action.service",["ui.router"]).factory("ActionService",["$rootScope","$state",function(a,b){var c;return c=function(){function a(a){this.options=a}return a.prototype.CODE={TR_VALUE:"value"},a.prototype.CSS={WEIGHT:"weight",REJECT_CSS:"reject-css",REQUIRE_CSS:"require-css"},a.prototype.INFO={REJECT:"you must select {0} records to perform this action",REJECT_AT_LEAST:"you must select {0} records to perform this action at least",CHECK_STATUS:"you can't perform this action, please check the status of records which were selected"},a.prototype.passedSelections=function(a){var b,c;return b=this.getConditions(a),c=this.getSelections(),this.checkConditionPass(b,c),c.datas},a.prototype.gotoState=function(a,c){var d,e;try{return e=this.passedSelections(c),b.go(a,e[0])}catch(f){return d=f,alert(d)}},a.prototype.perform=function(a,b){var c,d,e,f,g,h;try{if(e=this.passedSelections(b),1===a.length){for(h=[],f=0,g=e.length;g>f;f++)d=e[f],h.push(a(d));return h}return a.apply(this,e)}catch(i){return c=i,alert(c)}},a.prototype.checkConditionPass=function(a,b){var c,d;if(/^\d+$/.test(a.weight)){if(d=parseInt(a.weight),d===b.datas.length)return void this.checkStatus(a,b);throw this.stringFormat(this.INFO.REJECT,d)}if(/^\d+\+$/.test(a.weight)){if(c=parseInt(a.weight.split(/\+/)[0]),b.datas.length>=c)return void this.checkStatus(a,b);throw this.stringFormat(this.INFO.REJECT_AT_LEAST,c)}},a.prototype.checkStatus=function(a,b){if(!this.isCssPass(a,b))throw this.INFO.CHECK_STATUS},a.prototype.isCssPass=function(a,b){var c,d;return c=this.getCss(a.rejectCss),d=this.getCss(a.requireCss),this.isReject(c,b.trs)?!1:this.isRequire(d,b.trs)},a.prototype.isReject=function(a,b){var c,d,e,f,g;for(f=0,g=b.length;g>f;f++){d=b[f],e=this.getClass(d);for(c in a)if(null!=e[c])return!0}return!1},a.prototype.isRequire=function(a,b){var c,d,e,f,g;for(f=0,g=b.length;g>f;f++){d=b[f],e=this.getClass(d);for(c in a)if(null==e[c])return!1}return!0},a.prototype.getConditions=function(a){var b,c;return c=$(a.srcElement),b={weight:c.attr(this.CSS.WEIGHT),rejectCss:c.attr(this.CSS.REJECT_CSS),requireCss:c.attr(this.CSS.REQUIRE_CSS)}},a.prototype.getSelections=function(){var a,b,c,d;b={datas:[],trs:[]},d=this.options.watch.items;for(a in d)c=d[a],c&&(b.datas.push(this.options.mapping(a)),b.trs.push($("["+this.CODE.TR_VALUE+"="+a+"]")));return b},a.prototype.getCss=function(a){var b,c,d,e,f;if(c={},null!=a)for(f=a.split(/\s+/),d=0,e=f.length;e>d;d++)b=f[d],c[b]=b;return c},a.prototype.getClass=function(a){return this.getCss($(a).attr("class"))},a.prototype.stringFormat=function(){var a,b,c,d,e,f;if(0===arguments.length)return null;for(c=arguments[0],a=e=0,f=arguments.length;f>e;a=++e)d=arguments[a],0!==a&&(b=new RegExp("\\{"+(a-1)+"\\}","gm"),c=c.replace(b,d));return c},a.make=function(b){return new a(b)},a}()}])}.call(this);