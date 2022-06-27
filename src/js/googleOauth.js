'use strict';

/**
 * A module to include instead of `angularOauth` for a service preconfigured
 * for Google OAuth authentication.
 *
 * Guide: https://developers.google.com/accounts/docs/OAuth2UserAgent
 */
angular.module('googleOauth', ['angularOauth']).

  constant('GoogleTokenVerifier', function(config, accessToken) {
    var $injector = angular.injector(['ng']);
    return $injector.invoke(['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
      var deferred = $q.defer();
      var verificationEndpoint = 'https://login.microsoftonline.com/c5bcb2d8-6b4a-4cd4-a517-7cd85a7a8a55/oauth2/v2.0/token';

      $rootScope.$apply(function() {
        $http({method: 'GET', url: verificationEndpoint, params: {access_token: accessToken}}).
          success(function(data) {
            if (data.audience == config.clientId) {
              deferred.resolve(data);
            } else {
              deferred.reject({name: 'invalid_audience'});
            }
          }).
          error(function(data, status, headers, config) {
            deferred.reject({
              name: 'error_response',
              data: data,
              status: status,
              headers: headers,
              config: config
            });
          });
      });

      return deferred.promise;
    }]);
  }).

  config(function(TokenProvider, GoogleTokenVerifier) {
    TokenProvider.extendConfig({
      authorizationEndpoint: 'https://login.microsoftonline.com/c5bcb2d8-6b4a-4cd4-a517-7cd85a7a8a55/oauth2/v2.0/authorize',
      scopes: ["api://4231b4c2-0c35-47ea-8960-be5f5a2e92a1/token"],
      verifyFunc: GoogleTokenVerifier
    });
  });

