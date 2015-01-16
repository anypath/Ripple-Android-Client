﻿(function () {
    var irApp = angular.module('irApp');

    irApp.factory('nameResolver', ['$http', 'clientSession', function ($http, clientSession) {
        var nameCache = [];

        var resolveName = function (address, onResolve) {
            var session = clientSession.session();
            // Is it our address? No need to lookup.
            if (address = session.address) {
                onResolve(session.username);
                return;
            }
            // Next resolve with contacts.
            var possibleContact = Enumerable.From(session.contacts).FirstOrDefault(false, function (x) { return x.address == address; });
            if (possibleContact) {
                onResolve(possibleContact.name);
                return;
            }
            // Then try Ripple identity.
            if (nameCache[address]) {
                if (nameCache[address].name != null) {
                    onResolve(nameCache[address].name);
                } else {
                    nameCache[address].resolving.push(onResolve);
                }
            } else {
                nameCache[address] = { name: null, resolving: [] };
                $http.get('https://id.ripple.com/v1/user/' + address).success(function(res) {
                    var username = res.username;
                    if (username) {
                        nameCache[address].name = '~' + username;
                    } else {
                        nameCache[address].name = address;
                    }
                    onResolve(nameCache[address].name);
                    nameCache[address].resolving.forEach(function(waitingResolve) {
                        waitingResolve(nameCache[address].name);
                    });
                    nameCache[address].resolving = [];
                });
            }
        }

        return {
            resolve: resolveName
        };
    }]);
})();