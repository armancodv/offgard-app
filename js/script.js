'use strict';
var app = angular.module('app', [
    'ngRoute',
    'mobile-angular-ui',
    'mobile-angular-ui.gestures',
    'ui.bootstrap.persian.datepicker',
    'ui.bootstrap.datepicker'
]);

app.run(function ($transform) {
    window.$transform = $transform;
});

app.config(function ($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'pages/home.html', reloadOnSearch: false});
    $routeProvider.when('/search', {templateUrl: 'pages/search.html', reloadOnSearch: false});
    $routeProvider.when('/search/:keyword', {templateUrl: 'pages/search.html', reloadOnSearch: false});
    $routeProvider.when('/off/:off_id', {templateUrl: 'pages/off.html', reloadOnSearch: false});
    $routeProvider.when('/login', {templateUrl: 'pages/login.html', reloadOnSearch: false});
    $routeProvider.when('/signup', {templateUrl: 'pages/signup.html', reloadOnSearch: false});
    $routeProvider.when('/reset', {templateUrl: 'pages/reset.html', reloadOnSearch: false});
    $routeProvider.when('/my-offs', {templateUrl: 'pages/my-offs.html', reloadOnSearch: false});
    $routeProvider.when('/add-off', {templateUrl: 'pages/add-off.html', reloadOnSearch: false});
    $routeProvider.when('/edit-off', {templateUrl: 'pages/edit-off.html', reloadOnSearch: false});
    $routeProvider.when('/cities', {templateUrl: 'pages/cities.html', reloadOnSearch: false});
    $routeProvider.when('/categories', {templateUrl: 'pages/categories.html', reloadOnSearch: false});
    $routeProvider.when('/rule', {templateUrl: 'pages/rule.html', reloadOnSearch: false});
    $routeProvider.when('/about', {templateUrl: 'pages/about.html', reloadOnSearch: false});
    $routeProvider.when('/contact', {templateUrl: 'pages/contact.html', reloadOnSearch: false});
});

app.directive('toucharea', ['$touch', function ($touch) {
    return {
        restrict: 'C',
        link: function ($scope, elem) {
            $scope.touch = null;
            $touch.bind(elem, {
                start: function (touch) {
                    $scope.containerRect = elem[0].getBoundingClientRect();
                    $scope.touch = touch;
                    $scope.$apply();
                },
                cancel: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },
                move: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                },
                end: function (touch) {
                    $scope.touch = touch;
                    $scope.$apply();
                }
            });
        }
    };
}]);

app.directive('dragToDismiss', function ($drag, $parse, $timeout) {
    return {
        restrict: 'A',
        compile: function (elem, attrs) {
            var dismissFn = $parse(attrs.dragToDismiss);
            return function (scope, elem) {
                var dismiss = false;
                $drag.bind(elem, {
                    transform: $drag.TRANSLATE_RIGHT,
                    move: function (drag) {
                        if (drag.distanceX >= drag.rect.width / 4) {
                            dismiss = true;
                            elem.addClass('dismiss');
                        } else {
                            dismiss = false;
                            elem.removeClass('dismiss');
                        }
                    },
                    cancel: function () {
                        elem.removeClass('dismiss');
                    },
                    end: function (drag) {
                        if (dismiss) {
                            elem.addClass('dismitted');
                            $timeout(function () {
                                scope.$apply(function () {
                                    dismissFn(scope);
                                });
                            }, 300);
                        } else {
                            drag.reset();
                        }
                    }
                });
            };
        }
    };
});

app.directive('carousel', function () {
    return {
        restrict: 'C',
        scope: {},
        controller: function () {
            this.itemCount = 0;
            this.activeItem = null;
            this.addItem = function () {
                var newId = this.itemCount++;
                this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
                return newId;
            };
            this.next = function () {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
            };
            this.prev = function () {
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
            };
        }
    };
});

app.directive('carouselItem', function ($drag) {
    return {
        restrict: 'C',
        require: '^carousel',
        scope: {},
        transclude: true,
        template: '<div class="item"><div ng-transclude></div></div>',
        link: function (scope, elem, attrs, carousel) {
            scope.carousel = carousel;
            var id = carousel.addItem();
            var zIndex = function () {
                var res = 0;
                if (id === carousel.activeItem) {
                    res = 2000;
                } else if (carousel.activeItem < id) {
                    res = 2000 - (id - carousel.activeItem);
                } else {
                    res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
                }
                return res;
            };
            scope.$watch(function () {
                return carousel.activeItem;
            }, function () {
                elem[0].style.zIndex = zIndex();
            });
            $drag.bind(elem, {
                transform: function (element, transform, touch) {
                    var t = $drag.TRANSLATE_BOTH(element, transform, touch);
                    var Dx = touch.distanceX;
                    var t0 = touch.startTransform;
                    var sign = Dx < 0 ? -1 : 1;
                    var angle = sign * Math.min((Math.abs(Dx) / 700) * 30, 30);
                    t.rotateZ = angle + (Math.round(t0.rotateZ));
                    return t;
                },
                move: function (drag) {
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        elem.addClass('dismiss');
                    } else {
                        elem.removeClass('dismiss');
                    }
                },
                cancel: function () {
                    elem.removeClass('dismiss');
                },
                end: function (drag) {
                    elem.removeClass('dismiss');
                    if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        scope.$apply(function () {
                            carousel.next();
                        });
                    }
                    drag.reset();
                }
            });
        }
    };
});

app.directive('dragMe', ['$drag', function ($drag) {
    return {
        controller: function ($scope, $element) {
            $drag.bind($element,
                {
                    transform: $drag.TRANSLATE_INSIDE($element.parent()),
                    end: function (drag) {
                        drag.reset();
                    }
                },
                {
                    sensitiveArea: $element.parent()
                }
            );
        }
    };
}]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.filter('escape', function () {
    return window.encodeURIComponent;
});