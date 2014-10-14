angular.module('services', ['ngResource'])

  .factory('PhoneService', ['$resource', ($resource) ->
    return $resource 'json/:phoneId.json', {}, {
      query: {
        method: 'GET'
        params: {phoneId: 'phones'}
        isArray: true
      }
    }
  ])
