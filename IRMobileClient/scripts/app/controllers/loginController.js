﻿(function () {
    var irApp = angular.module('irApp');

    irApp.controller('loginController', [
        '$scope', 'analytics', '$state', 'clientSession', '$ionicLoading', '$timeout', '$ionicHistory',
        function ($scope, analytics, $state, clientSession, $ionicLoading, $timeout, $ionicHistory) {
            $scope.loginForm = {};

            if (window.bypass) {
                $scope.loginForm.bypass = true;
            }

            var vaultClient = null;
            $scope.twoFactorInfo = null;

            $scope.$on('$ionicView.enter', function () {
                var username = window.localStorage['ir.username'];
                if (username) {
                    $scope.loginForm.username = username;
                }
            });

            $scope.login = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                vaultClient = new rippleVaultClient.VaultClient();
                var deviceId = window.localStorage['ir.2faDeviceId'];
                if (!deviceId) {
                    deviceId = vaultClient.generateDeviceID();
                    window.localStorage['ir.2faDeviceId'] = deviceId;
                }
                vaultClient.loginAndUnlock($scope.loginForm.username || window.bypass_username, $scope.loginForm.password || window.bypass_password, deviceId, function (err, res) {
                    if (err) {
                        alert(err);
                        if (err.twofactor) {
                            $timeout(function() {
                                $scope.twoFactorInfo = err.twofactor;
                                $scope.loginForm.rememberMe = true;
                                $scope.loginForm.isError = false;
                                $ionicLoading.hide();
                            });
                        } else {
                            $timeout(function () {
                                delete $scope.loginForm.password;
                                $scope.loginForm.isError = true;
                                $ionicLoading.hide();
                            });
                        }
                    } else {
                        delete $scope.loginForm.password;
                        $ionicHistory.clearCache();
                        $ionicHistory.clearHistory();
                        window.localStorage['ir.username'] = res.username;
                        clientSession.start(res.username, res.blob.data.account_id, res.secret, res.blob);
                        $state.go('balances');
                    }
                });
            };
            $scope.twoFactorLogin = function () {
                $scope.loginForm.isError = false;
                $ionicLoading.show();
                if (!$scope.loginForm.rememberMe) {
                    // The vault client does not seem to respect our decision to not remember our device.
                    window.localStorage['ir.2faDeviceId'] = null;
                }
                vaultClient.verifyToken({
                    url: $scope.twoFactorInfo.blob_url,
                    id: $scope.twoFactorInfo.blob_id,
                    device_id: $scope.twoFactorInfo.device_id,
                    token: $scope.loginForm.token,
                    remember_me: $scope.loginForm.rememberMe
            }, function(err, res) {
                    if (err) {
                        $timeout(function() {
                            $scope.loginForm.isError = true;
                            $ionicLoading.hide();
                        });
                    } else {
                        vaultClient.loginAndUnlock($scope.loginForm.username || window.bypass_username, $scope.loginForm.password || window.bypass_password, $scope.twoFactorInfo.device_id, function(err2, res2) {
                            delete $scope.loginForm.password;
                            if (err2) {
                                $timeout(function () {
                                    delete $scope.loginForm.password;
                                    $scope.twoFactorInfo = null;
                                    $scope.loginForm.rememberMe = true;
                                    $scope.loginForm.isError = true;
                                    $ionicLoading.hide();
                                });
                            } else {
                                window.localStorage['ir.username'] = res2.username;
                                clientSession.start(res2.username, res2.blob.data.account_id, res2.secret, res2.blob);
                                $state.go('balances');
                            }
                        });
                    }
                });
            }
        }
    ]);
})();