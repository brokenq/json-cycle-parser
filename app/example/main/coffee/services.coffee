angular.module('services', ['ngResource'])

  .factory('CatService', ['$resource', ($resource) ->
    return $resource 'json/:type.json', {}, {
      query: {
        method: 'GET'
        params: {type: 'cat'}
        isArray: false
      }
    }
  ])
