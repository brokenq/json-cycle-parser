angular.module 'app', [
  'app.templates'
  'ngRoute'
  'ui.router'
  'main'
]
  .config(['$routeProvider',
    ($routeProvider) ->
      $routeProvider.when('/main',{
          templateUrl: 'app/example/main/jade/main.jade'
          controller: 'mainCtrl'
        }).otherwise({
          redirectTo: '/main'
        })
  ])