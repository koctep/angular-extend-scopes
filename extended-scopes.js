'use strict';

angular.module('extended-scopes', [])
.service('extend-digest', [
    '$rootScope',
    '$exceptionHandler',
    function(root, exception) {
      var scopes = [];
      var ttl = 10;

      this.add = function(scope) {
        if (scopes.length > ttl) {
          exception('extended scopes digest ttl excided ', ttl);
          return this;
        }
        scopes.push(scope);
        setTimeout(run, 0);
        return this;
      };

      function run() {
        if (scopes.length == 0) return;
        if (root.$$phase || scopes[0].$$phase) {return;}
        var scope = scopes.shift();
        scope.$digest();
        setTimeout(run, 0);
      };

      this.install = function(scope) {
        function newDigest() {
          var i = 0, l = scopes.length;
          if (this.$$phase) {
            for (i; i < l; i++)
              if (scopes[i] === this)
                return;
            scopes.push(this);
            return;
          }
          this.$$oldDigest();
        };

        scope.$$oldDigest = scope.$digest;
        scope.$digest = newDigest;
      }

      this.install(root);
    }
])
.provider('separatedScope', ['$rootScopeProvider', function(rootProvider) {
  this.$get = ['$injector', 'extend-digest', function(injector, digest) {
    return function() {
      var scope = injector.invoke(rootProvider.$get);
      digest.install(scope);
      return scope;
    };
  }];
}])
;
