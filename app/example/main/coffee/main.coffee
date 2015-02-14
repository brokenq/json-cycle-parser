angular.module('main', [
  'services'
  'JsonCycleParser'
])

  .controller('mainCtrl', ["$scope", "CatService", "JsonCycleParser", \
                           ($scope,   catService,   JsonCycleParser)->
    catService.query (data)->
      jsonCycleParser = new JsonCycleParser( data )
      $scope.cat = jsonCycleParser.json
      console.log $scope.cat
      console.log $scope.cat.children[0].children[0].grandFather

  ])


