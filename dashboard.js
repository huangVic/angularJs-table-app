var dashboardApp = angular.module('dashboardApp', [], function ($locationProvider) {
    $locationProvider.html5Mode(false);
});


dashboardApp.controller('NavCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.navClass = function (page) {
        var currentRoute = $location.absUrl().split("/")[5];
        //console.log(currentRoute)
      //  console.log($location.absUrl())
       // console.log($location.absUrl().split("/")[5])
       if(!currentRoute){
    	   currentRoute = 'index'
       }
       if(currentRoute.length >=50){
    	   currentRoute = currentRoute.split("?")[0];
    	   //console.log(">>>>>: " + currentRoute)
       }
        //console.log('--> ' + currentRoute)
        return page === currentRoute ? 'active' : '';
    };
}]);


dashboardApp.controller('fieldSyncListCtrl', ['$scope', '$filter', '$http', function ($scope, $filter, $http) {

    $scope.sort = {
        sortingOrder: 'creationDate',
        reverse: true
    };
    // init

    $scope.gap = 5;
    $scope.nonfilertKey = ['app_ser', 'details'];
    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.itemsPerPage = 10;
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.items = []

    var po = Math.random()
    $http({
        method: 'GET',
        url: '/AsiaVocAdmin/dashboard/getTransationData',
        cache: false,
        params: { _po: po },
        headers: { 'Content-Type': 'application/json' }
    })
    .success(function (data) {
        $scope.items=data;     

        var searchVaildate = function (attr) {
            if (!attr) {
                return false;
            }
            for (var val in $scope.nonfilertKey) {
                //console.log('val >> ' + $scope.nonfilertKey[val])
                if ($scope.nonfilertKey[val].toLowerCase() === attr.toLowerCase()) {
                    return false
                }
            };
            return true
        }

        var searchMatch = function (haystack, needle) {
            //console.log('needle >> ' + needle)
            //console.log('haystack >> ' + haystack)
            if (!needle) {
                return true;
            }
            //console.log('#### ' + haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1)
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
        };

        // init the filtered items
        $scope.search = function () {
            $scope.selectItems = [];
            $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                
            	for (var attr in item) {         
                    /*
            		console.log('======================')
                    console.log('query >> ' + $scope.query)
                    console.log('attr >> ' + attr)
                    console.log('item >> ' + item[attr])
                    console.log('return >> ' + searchVaildate(attr))
                    */
                    //if (searchVaildate(attr)) {
                        if (searchMatch(item[attr], $scope.query)){
                            return true;
                        }
                    //}
                }
                return false;
            });
            // take care of the sorting order
            if ($scope.sort.sortingOrder !== '') {
                $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sort.sortingOrder, $scope.sort.reverse);
            }
            $scope.currentPage = 0;
            // now group by pages
            $scope.groupToPages();
        };


        // calculate page in place
        $scope.groupToPages = function () {
            $scope.pagedItems = [];

            for (var i = 0; i < $scope.filteredItems.length; i++) {
                if (i % $scope.itemsPerPage === 0) {
                    $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]];
                } else {
                    $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                }
            }
        };

        $scope.range = function (size, start, end) {
            var ret = [];
            //console.log(size, start, end);

            if (size < end) {
                end = size;
                start = size - $scope.gap;
            }
            for (var i = start; i < end; i++) {
                if (i >= 0) {
                    ret.push(i);
                }
            }
            //console.log(ret);
            return ret;
        };

        $scope.prevPage = function () {
            $scope.selectItems = [];
            // $scope.detailsItems = [];
            if ($scope.currentPage > 0) {
                $scope.currentPage--;
            }
        };

        $scope.nextPage = function () {
            $scope.selectItems = [];
            // $scope.detailsItems = [];
            if ($scope.currentPage < $scope.pagedItems.length - 1) {
                $scope.currentPage++;
            }
        };

        $scope.setPage = function () {
            $scope.selectItems = [];
            // $scope.detailsItems = [];
            $scope.currentPage = this.n;
        };

        // functions have been describe process the data for display
        $scope.search();

        $scope.toClose = function (appSer) {
            //console.log('>>>toClose ser : ' + appSer);
            $scope.selectItems = [];
        }
        
        $scope.openDetail = function (appSer) {
            //console.log('>>> : ' + appSer);
            $scope.selectItems = [];

            for (var attr in $scope.items) {
                //console.log('attr >>> : ' + attr)
                //console.log('items >>> : ' + $scope.items[attr].app_ser)
                if ($scope.items[attr].id === appSer) {

                    $scope.selectItems.push($scope.items[attr]);
                    /*
                    for (var i = 0; i < $scope.items[attr].details.length; i++) {
                        console.log('details >>> : ' + $scope.items[attr].details[i]);
                        $scope.detailsItems.push($scope.items[attr].details[i]);
                    }
                    */
                }
            }
            //console.log('selectItems >>> : ' + $scope.selectItems)
        };
        
        
        $scope.goSysCustomFieldVal = function () {   	
        	$(".btn").attr("disabled", true)
        	$("#myTable").isLoading(
                     {
                         text: "執行中....",
                         'class': "fa fa-refresh",
                         'tpl': '<div class="alert alert-warning"><span class="isloading-wrapper %wrapper%">%text%<i class="%class%"></i></span></div>'
             });
              	
        	$http({
                method: 'POST',
                url: '/AsiaVocAdmin/customField/sysCustomFieldVal',
                cache: false,
                headers: { 'Content-Type': 'application/json' }
            })
            .success(function (data) {
            	console.log("### : " + data.msg)
            	if(data.msg==="OK"){
            		$("#myTable").isLoading("hide");
            		$(".btn").prop("disabled", false);
            	}
            });    
        };
        
        
        $scope.goRunIssuesJob = function () {   	
        	$(".btn").attr("disabled", true)
        	$("#myTable").isLoading(
                     {
                         text: "執行中....",
                         'class': "fa fa-refresh",
                         'tpl': '<div class="alert alert-warning"><span class="isloading-wrapper %wrapper%">%text%<i class="%class%"></i></span></div>'
             });
              	
        	$http({
                method: 'POST',
                url: '/AsiaVocAdmin/issueApi/runIssuesJob',
                cache: false,
                headers: { 'Content-Type': 'application/json' }
            })
            .success(function (data) {
            	console.log("### : " + data.msg)
            	if(data.msg==="OK"){
            		$("#myTable").isLoading("hide");
            		$(".btn").prop("disabled", false);
            	}
            });    
        }
        

    });
   
}]);



dashboardApp.$inject = ['$scope', '$filter', '$http'];


dashboardApp.directive("customSort", function () {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            order: '=',
            sort: '='
        },
        template:
          ' <a ng-click="sort_by(order)" >' +
          '    <span ng-transclude></span>' +
          '    <i ng-class="selectedCls(order)"></i>' +
          '</a>',
        link: function (scope) {

            // change sorting order
            scope.sort_by = function (newSortingOrder) {
                var sort = scope.sort;

                if (sort.sortingOrder == newSortingOrder) {
                    sort.reverse = !sort.reverse;
                }

                sort.sortingOrder = newSortingOrder;
            };


            scope.selectedCls = function (column) {
                if (column == scope.sort.sortingOrder) {
                    return ('fa fa-angle-' + ((scope.sort.reverse) ? 'down' : 'up'));
                }
                else {
                    return 'fa fa-sort'
                }
            };
        }// end link
    }
});
