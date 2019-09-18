app.controller('controller', function ($rootScope, $scope, $http, $routeParams) {
    $scope.userAgent = navigator.userAgent;
    $rootScope.$on('$routeChangeStart', function () {
        $rootScope.loading = true;
    });
    $rootScope.$on('$routeChangeSuccess', function () {
        $rootScope.loading = false;
    });

    /////////////////////// routes
    const SERVER = 'http://offgard.com/api/';
//    const SERVER = 'http://localhost/offgard-server/';
    const WEBAPP = 'http://offgard.com/app/';
    $scope.is_web_app = false;
    $scope.url = function (get) {
        return SERVER + '?' + serializeData(get);
    };
    $scope.show_captcha_url = function (captcha_id) {
        return SERVER + 'captcha.php?id=' + encodeURIComponent(captcha_id);
    };
    $scope.share_telegram = function (url, text) {
        return 'https://telegram.me/share/url?' + serializeData({url: WEBAPP + url, text: text});
    };
    $scope.share_facebook = function (url, text) {
        return 'https://www.facebook.com/sharer/sharer.php?' + serializeData({u: WEBAPP + url, t: text});
    };
    $scope.share_twitter = function (url, text) {
        return 'http://twitter.com/share?' + serializeData({url: WEBAPP + url, text: text});
    };
    $scope.share_google = function (url, text) {
        return 'https://plus.google.com/share?' + serializeData({url: WEBAPP + url});
    };
    $scope.share = function (message, subject, image, link) {
        window.plugins.socialsharing.share(message, subject, image, WEBAPP + link);
    };
    /////////////////////// local storage
    $scope.read_local_storage = function (varname) {
        try {
            $scope[varname] = JSON.parse(localStorage.getItem(varname));
        } catch (e) {
            if (localStorage.getItem(varname)) $scope[varname] = localStorage.getItem(varname);
            else $scope[varname] = {};
        }
    };
    $scope.write_local_storage = function (varname) {
        localStorage.setItem(varname, JSON.stringify($scope[varname]));
    };
    $scope.delete_local_storage = function (varname) {
        localStorage.setItem(varname, undefined);
    };
    $scope.set_loading = function (varname) {
        if (!$scope[varname]) $scope[varname] = {};
        $scope[varname].loading = true;
    };

    /////////////////////// captcha
    $scope.show_captcha = function () {
        var varname = 'captcha';
        var get = {
            p: 'captcha',
            m: 'get'
        };
        $scope.set_loading(varname);
        $http.get($scope.url(get))
            .then(function (response) {
                $scope[varname] = response.data;
                $scope.write_local_storage(varname);
            }, function (response) {
                $scope[varname] = [];
                $scope[varname].error = 'خطا در ارتباط';
            });
    };

    /////////////////////// user
    $scope.insert_user = function (username, password, firstname, lastname, email, phone, captcha_id, captcha_code) {
        var varname = 'login';
        var get = {
            p: 'user',
            m: 'post'
        };
        var post = {
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname,
            email: email,
            phone: phone,
            captcha_id: captcha_id,
            captcha_code: captcha_code
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) {
                $scope.write_local_storage(varname);
                $scope.show_myoffs($scope[varname].username, $scope[varname].token);
            }
            else {
                $scope.delete_local_storage(varname);
                $scope.show_captcha();
            }
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.edit_user = function (username, token, password, firstname, lastname) {
        var varname = 'edituser';
        var get = {
            p: 'user',
            m: 'post',
            username: username,
            token: token
        };
        var post = {
            password: password,
            firstname: firstname,
            lastname: lastname
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.insert_login = function (username, password, captcha_id, captcha_code) {
        var varname = 'login';
        var get = {
            p: 'login',
            m: 'post'
        };
        var post = {
            username: username,
            password: password,
            captcha_id: captcha_id,
            captcha_code: captcha_code
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) {
                $scope.write_local_storage(varname);
                $scope.show_myoffs($scope[varname].username, $scope[varname].token);
            }
            else {
                $scope.delete_local_storage(varname);
                $scope.show_captcha();
            }
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.reset_login = function (email, captcha_id, captcha_code) {
        var varname = 'reset';
        var get = {
            p: 'reset',
            m: 'post'
        };
        var post = {
            email: email,
            captcha_id: captcha_id,
            captcha_code: captcha_code
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            $scope.show_captcha();
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.insert_logout = function (username, token) {
        var varname = 'logout';
        var get = {
            p: 'login',
            m: 'delete',
            username: username,
            token: token
        };
        $scope.set_loading(varname);
        $http.get($scope.url(get))
            .then(function (response) {
                $scope[varname] = response.data;
                if ($scope[varname].status) $scope.write_local_storage(varname);
                else {
                    $scope.delete_local_storage(varname);
                    $scope.show_captcha();
                }
                $scope.login = null;
                $scope.write_local_storage('login');
            }, function (response) {
                $scope[varname] = [];
                $scope[varname].error = 'خطا در ارتباط';
            });
    };
    /////


    /////////////////////// off
    $scope.show_offs = function (page, keyword) {
        if (!page) page = 1;
        var varname = 'offs';
        var get = {
            p: 'off',
            m: 'get',
            page: page
        };
        var post = {
            category: $scope.category_selected.code,
            city: $scope.city_selected.code,
            keyword: keyword
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) $scope.write_local_storage(varname);
            else $scope.delete_local_storage(varname);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.show_off = function (id) {
        var varname = 'off';
        var get = {
            p: 'off',
            m: 'get'
        };
        var post = {
            id: id || $routeParams.off_id
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) {
                $scope.write_local_storage(varname);
                var key = findElement($scope.offs.result, 'id', id);
                $scope.offs.result[key] = $scope.off.result[0];
            }
            else $scope.delete_local_storage(varname);
            // $scope.title=$scope[varname].result[0].name;
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.show_myoffs = function (username, token) {
        var varname = 'myoffs';
        var get = {
            p: 'myoff',
            m: 'get',
            username: username,
            token: token
        };
        var post = {};
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) $scope.write_local_storage(varname);
            else $scope.delete_local_storage(varname);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.insert_off = function (username, token, category_code, city_code, name, image, address, description, latitude, longitude, date_from, date_to, off_min, off_max) {
        var varname = 'off';
        var get = {
            p: 'off',
            m: 'post',
            username: username,
            token: token
        };
        var post = {
            category_code: category_code,
            city_code: city_code,
            name: name,
            address: address,
            description: description,
            latitude: latitude,
            longitude: longitude,
            date_from: getFormattedDate(date_from),
            date_to: getFormattedDate(date_to),
            off_min: off_min,
            off_max: off_max
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            $scope.update_off();
            if (image) {
                $scope.insert_image(username, token, $scope[varname].id, image);
            }
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.edit_off = function (username, token, id, category_code, city_code, name, image, address, description, latitude, longitude, date_from, date_to, off_min, off_max) {
        var varname = 'off';
        var get = {
            p: 'off',
            m: 'put',
            username: username,
            token: token
        };
        var post = {
            id: id,
            category_code: category_code,
            city_code: city_code,
            name: name,
            address: address,
            description: description,
            latitude: latitude,
            longitude: longitude,
            date_from: getFormattedDate(date_from),
            date_to: getFormattedDate(date_to),
            off_min: off_min,
            off_max: off_max
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if (image) {
                $scope.insert_image(username, token, id, image);
            }
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.delete_off = function (username, token, id) {
        var varname = 'off';
        var get = {
            p: 'off',
            m: 'delete',
            username: username,
            token: token
        };
        var post = {
            id: id
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.update_off = function () {
        var get = {
            p: 'off',
            m: 'update'
        };
        var post = {};
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
        }, function (response) {
        });
    };
    /////
    $scope.next_page = function () {
        if ($scope.offs.page.show_next_page) {
            $scope.show_offs($scope.offs.page.next_page);
        }
    };
    /////
    $scope.previous_page = function () {
        if ($scope.offs.page.show_previous_page) {
            $scope.show_offs($scope.offs.page.previous_page);
        }
    };
    /////
    $scope.get_keyword = function () {
        $scope.keyword = $routeParams.keyword;
        $scope.show_offs(undefined, $scope.keyword);
    };
    /////
    $scope.change_keyword = function (keyword) {
        window.location.replace('#/search/' + keyword);
    };

    /////////////////////// comment
    $scope.show_comments = function (off_id) {
        var varname = 'comments';
        var get = {
            p: 'comment',
            m: 'get'
        };
        var post = {
            off_id: off_id
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) $scope.write_local_storage(varname);
            else $scope.delete_local_storage(varname);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.insert_comment = function (username, token, off_id, rate) {
        var varname = 'comment';
        var get = {
            p: 'comment',
            m: 'post',
            username: username,
            token: token
        };
        var post = {
            off_id: off_id,
            rate: rate
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            $scope.show_off(off_id);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.delete_comment = function (username, token, id) {
        var varname = 'comment';
        var get = {
            p: 'comment',
            m: 'delete',
            username: username,
            token: token
        };
        var post = {
            id: id
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////

    /////////////////////// images
    $scope.insert_image = function (username, token, off_id, image) {
        var varname = 'image';
        var get = {
            p: 'image',
            m: 'post',
            username: username,
            token: token,
            off_id: off_id
        };
        var fd = new FormData();
        fd.append('image', image);
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined, 'Process-Data': false},
            data: fd
        }).then(function (response) {
            $scope[varname] = response.data;
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.delete_image = function (username, token, id) {
        var varname = 'image';
        var get = {
            p: 'image',
            m: 'delete',
            username: username,
            token: token
        };
        var post = {
            off_id: id
        };
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////

    /////////////////////// category
    $scope.show_categories = function () {
        var varname = 'categories';
        var get = {
            p: 'category',
            m: 'get'
        };
        $scope.set_loading(varname);
        $http.get($scope.url(get)).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) $scope.write_local_storage(varname);
            else $scope.delete_local_storage(varname);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.select_category = function (item) {
        $scope.category_selected = item;
        $scope.write_local_storage('category_selected');
    };

    /////////////////////// city
    $scope.show_cities = function () {
        var varname = 'cities';
        var get = {
            p: 'city',
            m: 'get'
        };
        $scope.set_loading(varname);
        $http.get($scope.url(get)).then(function (response) {
            $scope[varname] = response.data;
            if ($scope[varname].status) $scope.write_local_storage(varname);
            else $scope.delete_local_storage(varname);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };
    /////
    $scope.select_city = function (item) {
        $scope.city_selected = item;
        $scope.write_local_storage('city_selected');
    };

    /////////////////////// advertisement
    $scope.show_advertisements = function () {
        var varname = 'advertisements';
        var get = {
            p: 'advertisement',
            m: 'get'
        };
        var post = {};
        $scope.set_loading(varname);
        $http({
            url: $scope.url(get),
            method: 'POST',
            data: post
        }).then(function (response) {
            $scope[varname] = response.data;
            $scope.write_local_storage(varname);
        }, function (response) {
            $scope[varname] = [];
            $scope[varname].error = 'خطا در ارتباط';
        });
    };


    $scope.open_link = function (link) {
        window.open(link, '_system');
    };

    /////////////////////// date
    $scope.date_from = new Date();
    $scope.date_to = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 20);
    $scope.date_min = new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 60);
    $scope.date_max = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 60);

    $scope.selecttoeditoff = function (item) {
        $scope.editoff = item;
        $scope.editoff.date_from = new Date($scope.editoff.date_from);
        $scope.editoff.date_to = new Date($scope.editoff.date_to);
        $scope.editoff.off_min = parseInt($scope.editoff.off_min);
        $scope.editoff.off_max = parseInt($scope.editoff.off_max);
        $scope.write_local_storage('editoff');
    };

    $scope.delete_message = function () {
        if ($scope.login) {
            $scope.login.error = undefined;
            $scope.login.success = undefined;
            $scope.write_local_storage('login');
        }
        if ($scope.reset) {
            $scope.reset.error = undefined;
            $scope.reset.success = undefined;
            $scope.write_local_storage('reset');
        }
        if ($scope.off) {
            $scope.off.error = undefined;
            $scope.off.success = undefined;
            $scope.write_local_storage('off');
        }
    };

    /////////////////////// init
    $scope.read_local_storage('captcha');
    $scope.read_local_storage('login');
    $scope.read_local_storage('city_selected');
    $scope.read_local_storage('category_selected');
    $scope.read_local_storage('offs');
    $scope.read_local_storage('myoffs');
    $scope.read_local_storage('editoff');
    $scope.show_categories();
    $scope.show_cities();
    if (($scope.category_selected == '') || (!$scope.category_selected)) {
        $scope.select_category({name: 'همه', code: ''});
    }
    if (($scope.city_selected == '') || (!$scope.city_selected)) {
        $scope.select_city({name: 'همه', code: ''});
    }
    $scope.show_advertisements();
    if (($scope.login) && ($scope.login.status)) {
        $scope.show_myoffs($scope.login.username, $scope.login.token);
    }
    $scope.delete_message();
});

function serializeData(data) {
    if (!angular.isObject(data)) {
        return ( ( data == null ) ? "" : data.toString() );
    }
    var buffer = [];
    for (var name in data) {
        if (!data.hasOwnProperty(name)) {
            continue;
        }
        var value = data[name];
        buffer.push(
            encodeURIComponent(name) + "=" + encodeURIComponent(( value == null ) ? "" : value)
        );
    }
    var source = buffer.join("&").replace(/%20/g, "+");
    return ( source );
}

function getFormattedDate(date) {
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
}

function findElement(arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue) {
            return i;
        }
}
