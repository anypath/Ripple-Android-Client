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
                .state('home', {
                    url: '/home',
                    templateUrl: 'views/home.html',
                    controller: 'homeController'
                })
                .state('contacts', {
                    url: '/contacts',
                    templateUrl: 'views/contacts.html',
                    controller: 'contactsController'
                });
        }
    ]);
})();