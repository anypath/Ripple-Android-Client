﻿(function() {
    var irApp = angular.module('irApp', ['ngCordova', 'ionic']);

    ionic.Platform.isFullScreen = true;

    irApp.config([
        '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');

            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login.html',
                    controller: 'loginController'
                })
                .state('balances', {
                    templateUrl: 'views/balances.html',
                    controller: 'balancesController'
                })
                .state('contacts', {
                    templateUrl: 'views/contacts.html',
                    controller: 'contactsController'
                });
        }
    ]);
})();