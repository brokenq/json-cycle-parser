angular.module 'table', [
  'services'
  'ngTable'
  'table.detail'
  'dnt.action.service'
]
  .config ($stateProvider)->
    $stateProvider.state 'table',
      url: '/table'
      templateUrl: 'app/example/main/jade/table.jade'

  #  inject into ActionService
  .controller 'tableCtrl', ['$scope', 'PhoneService', 'ngTableParams', 'ActionService', '$location', '$timeout', '$filter', ($scope, PhoneService, ngTableParams, ActionService, $location, $timeout, $filter)->
    options =
      page:  1          # show first page
      count: 10           # count per page
    args =
      total: 0
      getData: ($defer, params)->
        PhoneService.query(params.url(), (data, headers) ->
          $timeout(->
            params.total(headers('total'))
            $defer.resolve($scope.phones = data)
          , 500)
        )
    $scope.tableParams = new ngTableParams(angular.extend(options, $location.search()), args)

    ### @object: selection | 使用ngTable需要定义的Json数据，也是ActionService需要使用的Json数据
          @key: checked | 是否全选
            @value: 【true|false】 | true: 全选；false: 非全选
          @key: items | 选项Json数据
            @value: 【json】 | 行数据指定的属性值作为key，true|false作为值，选中为true，未选中为false
              @demo: <code>input(type='checkbox', ng-model="selection.items[phone.id]")</code>
                     <desc>假设phones = [{id: 1},{id: 2},{id: 3}];
                           id = 1, 3 的行被选中，那么selections.items = {1: true, 2: false, 3: true}
                     </desc>
    ###
    $scope.selection = {checked: false, items: {}}
    $scope.getPhoneById  = (id)->
      return phone for phone in $scope.phones when phone.id is parseInt id
    $scope.actionService = new ActionService({watch: $scope.selection.items, mapping: $scope.getPhoneById})

    $scope.$watch 'selection.checked', (value)->
      angular.forEach $scope.phones, (item)->
        $scope.selection.items[item.id] = value if angular.isDefined(item.id)
    # watch for data checkboxes
    $scope.$watch('selection.items', (values) ->
      return if !$scope.phones
      checked = 0
      unchecked = 0
      total = $scope.phones.length
      angular.forEach $scope.phones, (item)->
        checked   +=  ($scope.selection.items[item.id]) || 0
        unchecked += (!$scope.selection.items[item.id]) || 0
      $scope.selection.checked = (checked == total) if (unchecked == 0) || (checked == 0)
      # grayed checkbox
      angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));
    , true)

    $scope.reject = (phone)->
      alert "reject: #{$filter('json')(phone)}"
    $scope.approve = (phone)->
      alert "approve: #{$filter('json')(phone)}"
    $scope.compare = (phone1, phone2)->
      alert "compare: \n phone1: #{$filter('json')(phone1)} \n phone2: #{$filter('json')(phone2)}"
    $scope.refresh = ->
      alert "refresh"
    $scope.testWeight = (phones)->
      alert "testWeight: #{$filter('json')(phones)}"
    $scope.testEmptyCss = (phones)->
      alert "testEmptyCss: #{$filter('json')(phones)}"
    $scope.testA = (phones)->
      alert "testA: #{$filter('json')(phones)}"

  ]