/**
 * Created by leo on 3/24/15.
 */


var portal =angular
    .module('portalApp', ['openlayers-directive','ui.bootstrap', 'ui.bootstrap.treeview'])

/**
 * THE BEGINNING OF PORTAL CONTROLLER FUNCTION (MAIN COTROLLER)
 * */
    .controller("portalController",['$scope','$http','shared',function($scope,$http,shared){

        var url = "http://hrhis.moh.go.tz:9090/api/dashboards.json?paging=false";
        //var url = "https://dhis.moh.go.tz/api/dashboards.json?paging=false";
        $scope.dashboards = null;
        $scope.dashboards = function(){
            $http({
                method: 'GET',
                url: url
            }).success(
                function(data) {
                    $scope.dashboards = data.dashboards;
                    console.log($scope.dashboards);

                });
        };

        $scope.dashboards();

        $scope.antenatal = true;

        $scope.particularDashboard = function(menu,id){
            var el = document.body.querySelector("li");

            angular.element(".dashboard_menus").parent().removeClass("active");
            var link = angular.element("#"+id).parent();
            link.addClass("active");
            if(menu.indexOf("Immunization")>=0){

                $scope.antenatal = false;
                $scope.completenes = false;
                $scope.death = false;
                $scope.resource = false;
                $scope.immunization = true;
            }
            if(menu.indexOf("Resource")>=0){
                $scope.antenatal = false;
                $scope.completenes = false;
                $scope.death = false;
                $scope.resource = true;
                $scope.immunization = false;
            }
            if(menu.indexOf("Death")>=0){
                $scope.antenatal = false;
                $scope.completenes = false;
                $scope.death = true;
                $scope.resource = false;
                $scope.immunization = false;
            }
            if(menu.indexOf("Completeness")>=0){
                $scope.antenatal = false;
                $scope.completenes = true;
                $scope.death = false;
                $scope.resource = false;
                $scope.immunization = false;
            }
            if(menu.indexOf("Antenatal")>=0){
                $scope.antenatal = true;
                $scope.completenes = false;
                $scope.death = false;
                $scope.resource = false;
                $scope.immunization = false;
            }
        }
        $scope.particularDashboard("Antenatal Care","Vlw8KFHG4cV");

        //http://localhost:8000/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed
    }]);
/**
 * THE BEGINNING OF MAP CONTROLLER FUNCTION
 * */
portal.controller("mapController", [ '$scope', '$http', 'olData','olHelpers','shared', function($scope, $http, olData,olHelpers,shared) {


/// indicators URL
    var Indicators = {
        anc_12:'TRoamv0YPt3',
        anc_fisrt:'QiA9L6tNHFy',
        inst:'bzTuXoKa87E',
        post:'S0cn3ephUSs',
        measle:'wM0Lz10TaMU',
        penta3:'U10A7hLOxgq',
        vitaminA:'j1mwtqSyifi',
        child:'uOOJi6b0pzm',
        cervical:'oBTUbnPkrMT'
        //,
        //doctor:'',
        //nurse:'',
        //complete:''

    };

    var ANIC_Before_12_weeks_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:TRoamv0YPt3&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var ANC_first_visit_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:oazOp512ShT&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var Institutional_delivery_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:bzTuXoKa87E&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var Postinatal_care_URL = "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:S0cn3ephUSs&dimension=pe:2014&filter=ou:lgZ6HfZaj3f&displayProperty=NAME";
    var Measles_vaccination_less_than_12_URL = "";
    var Penta_3_URL = "";
    var Vitamin_A_URL = "";
    var Child_Under_weight_URL = "";
    var Cervical_cancer_screening_URL = "";
    var Doctors_and_AMO_URL = "";
    var Nurse_and_midwives_URL = "";
    var Completeness_URL = "";

    /**
     * THE BEGINNING OF THE FUNCTION THAT HANDLES HOME PAGE FUNCTIONALITY OF MAP
     * */

    (function(){
        $scope.shared = shared;
        shared.facility =3029;
        var pullDistricts = 'http://hrhis.moh.go.tz:9090//api/organisationUnits.json?fields=id,name&level=3';
        //var url = 'portal-module/geoFeatures.json';
        var url = 'portal-module/organisationUnits.geojson';
        var url1 = 'http://hrhis.moh.go.tz:9090/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed';

        $http({
            method: 'GET',
            url: url,
            dataType: "json",
            cache: true,
            ifModified: true
        }).success(
            function(data) {
                var TotalGeo = {
                    "type":"FeatureCollection",
                    "features":[]
                };
                var districtProperties = [];

                var dateObject = new Date();
                $scope.thisyear = dateObject.getFullYear();
                $scope.districts = {};
                $scope.DistrictFreeObject = [];
                angular.forEach(data.features, function (value, index) {
                    var hue = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
                    // creating dynamic colors for district
                    $scope.saveColorInlocalStorage(value.id,hue);

                    // prepare objects of district for properties to display on tooltip
                    districtProperties[value.id] = {
                        district_id:value.id,
                        year:$scope.thisyear,
                        name:value.properties.name,
                        "color":hue,
                        "facility":Math.floor(Math.random() * 256),
                        "anc_12":0,
                        "anc_fisrt":0,
                        "inst":0,
                        "post":0,
                        "measle":0,
                        "penta3":0,
                        "vitaminA":0,
                        "child":0,
                        "cervical":0,
                        "doctor":0,
                        "nurse":0,
                        "complete":0

                    };

                    $scope.DistrictFreeObject.push(districtProperties[value.id]);
                    $scope.districts[value.id]= districtProperties;

                    // creating geojson object
                    var Object =
                    {
                        "type":"Feature",
                        "id":value.id,
                        "properties":{
                            "name":value.properties
                        },
                        "geometry":{
                            "type":value.geometry.type,
                            "coordinates":value.geometry.coordinates
                        },
                        "style":{
                            fill:{
                                color:$scope.getColorFromLocalStorage(value.id),
                                opacity:5
                            },
                            stroke:{
                                color:'white',
                                width:2
                            }
                        }
                    };
                    TotalGeo.features.push(Object);

                });

                // function getter for district object
                var getColor = function(district){
                    if(!district || !district['district_id']){
                        return "#FFF";
                    }
                    var color = districtProperties[district['district_id']].color;
                    return color;
                }
                var getStyle = function(feature){

                    var style = olHelpers.createStyle({
                        fill:{
                            color:getColor($scope.districts[feature.getId()]),
                            opacity:0.4
                        },
                        stroke:{
                            color:'white',
                            width:2
                        }
                    });
                    return [ style ];

                }

                angular.extend($scope, {
                    Africa: {
                        lat: -6.45,
                        lon: 35,
                        zoom: 5.6
                    },
                    layers:[
                        {
                            name:'mapbox',
                            source: {
                                type: 'TileJSON',
                                url:'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
                            }
                        } ,
                        {
                            name:'geojson',
                            source: {
                                type: 'GeoJSON',
                                geojson: {
                                    object: TotalGeo
                                }
                            },
                            style: getStyle
                        }
                    ],defaults: {
                        events: {
                            layers: [ 'mousemove', 'click']
                        }
                    }
                });

                $scope.districts = {};
                angular.forEach($scope.DistrictFreeObject,function(data,index){
                    var district = data;
                    $scope.districts[district['district_id']] = district;
                });


                olData.getMap().then(function(map) {
                    var previousFeature;
                    var overlay = new ol.Overlay({
                        element: document.getElementById('districtbox'),
                        positioning: 'top-right',
                        offset: [100, -100],
                        position: [100, -100]
                    });
                    var overlayHidden = true;
                    // Mouse over function, called from the Leaflet Map Events
                    $scope.$on('openlayers.layers.geojson.mousemove', function(event, feature, olEvent) {
                        $scope.$apply(function(scope) {
                            scope.selectedDistrict = feature ? $scope.districts[feature.getId()] : '';
                            if(feature) {
                                // looping throught indicator types
                                angular.forEach(Indicators,function(value,index){


                                    $http({
                                        method: 'GET',
                                        url: "http://hrhis.moh.go.tz:9090/api/analytics.json?dimension=dx:"+value+"&dimension=pe:"+$scope.thisyear+"&filter=ou:"+feature.getId()+"&displayProperty=NAME",
                                        //url:"portal-module/testIndicatorType.json",
                                        dataType: "json",
                                        cache: true,
                                        ifModified: true
                                    }).success(
                                        function(data) {
                                            var currentDistrict = $scope.districts[feature.getId()];
                                            if(data.rows[0]){
                                                if(value==data.rows[0][0]){

                                                    currentDistrict[index] = data.rows[0][2];
                                                }
                                            }

                                            $scope.districts[feature.getId()] = currentDistrict;
                                        });
                                });
                                scope.selectedDistrict = feature ? $scope.districts[feature.getId()] : '';
                            }
                        });

                        if (!feature) {
                            map.removeOverlay(overlay);
                            overlayHidden = true;
                            return;
                        } else if (overlayHidden) {
                            map.addOverlay(overlay);
                            overlayHidden = false;
                        }
                        overlay.setPosition(map.getEventCoordinate(olEvent));
                        if (feature) {
                            feature.setStyle(olHelpers.createStyle({
                                fill: {
                                    color: '#FFF'
                                }
                            }));
                            if (previousFeature && feature !== previousFeature) {
                                previousFeature.setStyle(getStyle(previousFeature));
                            }
                            previousFeature = feature;
                        }
                    });
                    $scope.$on('openlayers.layers.geojson.featuresadded', function(event, feature, olEvent) {
                        $scope.$apply(function(scope) {
                            if(feature) {
                                $scope.id = feature.getId();
                                scope.selectedDistrict = feature ? $scope.districts[feature.getId()]: '';
                            }
                        });

                    });
                });


            });
        var url = 'https://dhis.moh.go.tz/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed'


        $scope.saveColorInlocalStorage  = function(id,value){

            if(!$scope.getColorFromLocalStorage(id)){
                localStorage.setItem(id , value);
            }
        }

        $scope.getColorFromLocalStorage = function(id){
            var Item = localStorage.getItem( id );
            if(!Item){
                return false;
            }else{
                return Item;
            }

        }
    })();
    /**
     *  THE END
     * */
}]);


/**
 * THE BEGINNING OF ANALYSIS CONTROLLER FUNCTION
 * */

portal.factory('multipleSelectFactory',function(){
    var factory = {};
    factory.selectedItems =[];

    //factory.availableAction = function(){
    //    console.log($scope.myOptionAvailable);
    //}

    factory.selectedAction = function(selected){
        factory.selectedItems = selected;
    }
    return factory;

});
portal.directive('multipleSelect',['multipleSelectFactory',function(multipleSelectFactory){
    return {
        link:function($scope,element,attrs,ngModel){
            $scope.myOptionSelected=[];
            $scope.myOptionAvailable=[];
            $scope.Selects=[];
            var single_select = angular.element(document.querySelector('#single_select'));
            var single_return = angular.element(document.querySelector('#single_return'));
            var mult_select = angular.element(document.querySelector('#mult_select'));
            var mult_return = angular.element(document.querySelector('#mult_return'));
            var available_selection = angular.element(document.querySelector('#available_selection'));

            single_select.on("click",function(){
                $scope.$apply(function() {
                    angular.forEach($scope.myOptionAvailable,function(value,index){
                        angular.forEach($scope.Items,function(valueI,indexI){
                            if(valueI.id==value){
                                $scope.myOptionAvailable.splice(index,1);
                                $scope.Items.splice(indexI,1);
                                $scope.myOptionSelected=[];
                                $scope.Selects.push(valueI);
                                angular.forEach($scope.Selects,function(valueS,indexS){
                                    $scope.myOptionSelected.push(valueS.id);
                                });

                            }
                        });
                    });
                });
            });

            single_return.on("click",function(){
                $scope.$apply(function() {
                    angular.forEach($scope.myOptionSelected,function(value,index){
                        angular.forEach($scope.Selects,function(valueI,indexI){
                            if(valueI.id==value){
                                $scope.myOptionSelected.splice(index,1);
                                $scope.Selects.splice(indexI,1);
                                $scope.myOptionAvailable=[];
                                $scope.myOptionAvailable.push(value);
                                $scope.Items.push(valueI);
                                angular.forEach($scope.Items,function(valueS,indexS){
                                    $scope.myOptionAvailable.push(valueS.id);
                                });

                            }
                        });
                    });
                });
            });


            mult_select.on("click",function(){
                $scope.$apply(function() {
                    if($scope.Items.length>0){
                        $scope.Selects = $scope.Items;
                        angular.forEach($scope.Selects,function(value,index){
                            $scope.myOptionSelected.push(value.id);
                        });
                        $scope.Items = {};
                        $scope.myOptionAvailable=[];
                    }else{

                    }
                });

            });

            mult_return.on("click",function(){
                $scope.$apply(function() {
                    if($scope.Selects.length>0){
                        $scope.Items = $scope.Selects;
                        angular.forEach($scope.Selects,function(value,index){
                            $scope.myOptionAvailable.push(value.id);
                        });
                        $scope.Selects = {};
                        $scope.myOptionSelected =[];
                    }
                    var available_selection = angular.element(document.querySelector('#available_selection'));

                });

            });

            $scope.availableAction = function(){
            }

            $scope.$watch(function() {
                return $scope.myOptionSelected;
            }, function() {
                multipleSelectFactory.selectedAction($scope.myOptionSelected);
            });

        },
        scope: {
            Items: "=itemlist",
            Selects: "=ItemsSelected",
            collection: "=collection"
        },
        restrict:"E",
        templateUrl:"portal-module/mult-select-directive.html"
    }
}]);
portal.controller("analysisController",['$scope','$http','shared', 'TreeViewService','multipleSelectFactory',function($scope,$http,shared,TreeViewService,multipleSelectFactory){
    var indicatorsUrl = "portal-module/indicators.json";
    var orgunitsUrl = "portal-module/organisationUnits_level_1.json";
    $scope.analyticsUrl = null;;
    $scope.arrowUp = false;
    $scope.arrowDown = true;
    $scope.showForm = false;
    $scope.message = "Show the analysis menu";
    $scope.toggleAnalysismenu = function(){
        if($scope.arrowUp){
            $scope.arrowUp = false;
            $scope.showForm = false;
            $scope.message = "Show the analysis menu";
        }else{
            $scope.showForm = true;
            $scope.arrowUp = true;
            $scope.message = "Hide the analysis menu";
        }
        if($scope.arrowDown){

            $scope.arrowDown = false;
        }else{

            $scope.arrowDown = true;
        }
    }
    $scope.getIndicators = function(url,callBack){
        $http({
            method: 'GET',
            url: url
        }).success(callBack);
    }
    $scope.getOrgunits = function(url,callBack){
        $http({
            method: 'GET',
            url: url
        }).success(callBack);
    }

    var getPeriods = function(){
        var periods = [];
        var dateObject = new Date();
        var thisYear = dateObject.getFullYear();
        var milestonYear = 2015;
        var backTracer = 9;

        var elaps = thisYear - milestonYear;
        var begining = 0;
        if(elaps>0){
            newYear= milestonYear+elaps;
            for(var i=0;i<elaps;i++){
                var year = {id:newYear-i,value:newYear-i}
                periods.push(year);
            }
        }
        for(var i=0;i<backTracer;i++){
            var year = {id:milestonYear-i,value:milestonYear-i}
            periods.push(year);
        }
        return periods;
    }
    $scope.getIndicators(indicatorsUrl,function(data) {
        var pagerInfo = data.pager;
        var Indicators = data.indicators;
        angular.forEach(Indicators,function(value,index){
        });
        $scope.listIndicators = Indicators
        $scope.listperiods = getPeriods();

    });
    $scope.getOrgunits(orgunitsUrl,function(data) {
        var orgunits = data.organisationUnits;
        angular.forEach(orgunits,function(value,index){
        });
        $scope.listOrganisationUnits = orgunits;
    });



    $scope.selectedlistIndicators = [];
    $scope.selectedlistPeriods = [];
    $scope.selectedlistOrgunit = {};
    $scope.jsonObject = {};

    $scope.$watch(function() {
        return TreeViewService.selectedNode;
    }, function() {
        $scope.selectedlistOrgunit = TreeViewService.selectedNode;
    });

    $scope.$watchCollection(function() {
        return TreeViewService.selectedNodeMultiple;
    }, function() {
        $scope.selectedlistOrgunit = TreeViewService.selectedNodeMultiple;
    });
    $scope.$watchCollection(function() {
        return multipleSelectFactory.selectedItems;
    }, function() {
        $scope.selectedlistPeriods = multipleSelectFactory.selectedItems;
    });

    $scope.getDataFromDHISApi = function(selectedlistIndicators,selectedlistPeriods,selectedlistOrgunit){
        var data;
        var periodString = "";
        var periodlength = selectedlistPeriods.length;
        if(periodlength>1){
            selectedlistPeriods.sort();
            angular.forEach(selectedlistPeriods,function(value,index){
                console.log(value);
                if(index==periodlength-1){
                    periodString+=value;
                }else{
                    periodString+=value+";"
                }
            });
        }else{
            if(selectedlistPeriods[0]){

                periodString += selectedlistPeriods[0];
            }
        }

        var indicatorString = "";
        var indicatorlength = selectedlistIndicators.length;
        if(indicatorlength>1){
            angular.forEach(selectedlistIndicators,function(value,index){
                if(index==indicatorlength-1){
                    console.log(value);
                    indicatorString+=value.indicatorId;
                }else{
                    indicatorString+=value.indicatorId+";"
                }
            });
        }else{
            if(selectedlistIndicators[0]){
                indicatorString = selectedlistIndicators[0].indicatorId;
            }

        }

        var orgunitString = "";
        var orgunitlength = selectedlistOrgunit.length;
        if(orgunitlength>1){
            angular.forEach(selectedlistOrgunit,function(value,index){
                if(index==orgunitlength-1){
                    console.log(value);
                    orgunitString+=value.id;
                }else{
                    orgunitString+=value.id+";"
                }
            });
        }else{
            orgunitString = selectedlistOrgunit.id;
        }
        $scope.analyticsUrl = "/api/analytics.json?dimension=dx:"+indicatorString+"&dimension=pe:"+periodString+"&filter=ou:"+orgunitString+"&displayProperty=NAME";
        console.log($scope.analyticsUrl);

        return data;
    }


    $scope.getReport = function(reportType){

        // Getting selected Indicators
        var checker = 0;
        angular.forEach(angular.element($("#keepRenderingSort_to option")),function(value,index){
            var indicator = {indicatorId:value.value};
            $scope.selectedlistIndicators.push(indicator);
            checker++;
        });
        if(checker<1){
            $scope.selectedlistIndicators = [];
        }

        $scope.dataObject =  $scope.getDataFromDHISApi($scope.selectedlistIndicators,$scope.selectedlistPeriods,$scope.selectedlistOrgunit);



    }




}]);

portal.directive('multiSelect', function($q) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            selectedLabel: "@",
            availableLabel: "@",
            displayAttr: "@",
            available: "=",
            model: "=ngModel"
        },
        template: '<div class="multiSelect">' +
        '<div class="select">' +
        '<label class="control-label" for="multiSelectSelected" style="padding-bottom: 5px;border-bottom: 1px solid #ccc;">{{ selectedLabel }} ' +
        '</label>' +
        '<select style="display:block!important;" class="form-control" id="currentRoles" ng-model="selected.current" multiple ' +
        'class="pull-left" ><option ng-repeat="opt in model" value="{{opt}}">{{opt.value}}</option>' +
        '</select>' +
        '</div>' +
        '<div class="select buttons">' +
        '<button class="btn mover left btn-block" ng-click="add()" title="Add selected" ' +
        'ng-disabled="selected.available.length == 0">' +
        '<i class="glyphicon glyphicon-chevron-left"></i>' +
        '</button>' +
        '<button class="btn mover right btn-block " ng-click="remove()" title="Remove selected" ' +
        'ng-disabled="selected.current.length == 0">' +
        '<i class="glyphicon glyphicon-chevron-right"></i>' +
        '</button>' +
        '</div>' +
        '<div class="select">' +
        '<label class="control-label" for="multiSelectAvailable" style="padding-bottom: 5px;border-bottom: 1px solid #ccc;">{{ availableLabel }} ' +
        '</label>' +
        '<select style="display:block!important;" class="form-control" id="multiSelectAvailable" ng-model="selected.available" multiple ' +
        '><option ng-repeat="opt in available" value="{{opt}}">{{opt.value}}</option></select>' +
        '</div>' +
        '</div>',
        link: function(scope, elm, attrs) {
            scope.selected = {
                available: [],
                current: []
            };

            /* Handles cases where scope data hasn't been initialized yet */
            var dataLoading = function(scopeAttr) {
                var loading = $q.defer();
                if(scope[scopeAttr]) {
                    loading.resolve(scope[scopeAttr]);
                } else {
                    scope.$watch(scopeAttr, function(newValue, oldValue) {
                        if(newValue !== undefined)
                            loading.resolve(newValue);
                    });
                }
                return loading.promise;
            };

            /* Filters out items in original that are also in toFilter. Compares by reference. */
            var filterOut = function(original, toFilter) {
                var filtered = [];
                angular.forEach(original, function(entity) {
                    var match = false;
                    for(var i = 0; i < toFilter.length; i++) {
                        if(toFilter[i][attrs.displayAttr] == entity) {
                            match = true;
                            break;
                        }
                    }
                    if(!match) {
                        filtered.push(entity);
                    }
                });
                return filtered;
            };

            scope.refreshAvailable = function() {
                scope.available = filterOut(scope.available, scope.model);
                scope.selected.available = [];
                scope.selected.current = [];
            };

            scope.add = function() {
                scope.model = scope.model.concat(scope.selected.available);
                scope.refreshAvailable();
            };
            scope.remove = function() {
                scope.available = JSON.parse(scope.selected.current);//scope.available.concat(scope.selected.current);
                var Item = filterOut(scope.model, JSON.parse(scope.selected.current));
                scope.model = {id:Item,value:Item};
                scope.refreshAvailable();
            };

            $q.all([dataLoading("model"), dataLoading("available")]).then(function(results) {
                scope.refreshAvailable();
            });
        }
    };
});

/**
 * THE BEGINNING OF DASHBOARDS CONTROLLER FUNCTION
 * */
portal.controller("dashboardController",['$scope','$http','shared',function($scope,$http){

}]);


portal.factory('shared', function() {
    var shared = {
        "facility":0
    };
    return shared;
})
