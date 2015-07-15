/**
 * Created by leo on 3/24/15.
 */


var portal =angular
    .module('portalApp', ['openlayers-directive'])

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

        //http://localhost:8000/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed
    }]);
/**
 * THE BEGINNING OF MAP CONTROLLER FUNCTION
 * */
portal.controller("mapController", [ '$scope', '$http', 'olData','shared', function($scope, $http, olData,shared) {

    /**
     * THE BEGINNING OF THE FUNCTION THAT HANDLES HOME PAGE FUNCTIONALITY OF MAP
     * */
    (function(){
        $scope.shared = shared;
        shared.facility =3029;
        var url = 'portal-module/geoFeatures.json';
        var url1 = 'https://dhis.moh.go.tz/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed';
        $http({
            method: 'GET',
            url: url
        }).success(
            function(data) {
                var features = [];
                shared.facility = data.length;
                angular.forEach(data, function (value, index) {
                    var feat={
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates:JSON.parse(value.co)
                        },
                        properties: {
                            name: value.na,
                            radius: 2.5,
                            image:"",
                            color: "green"
                        }
                    };
                    features.push(feat);
                });
                $scope.feat = {
                    source: {
                        type: 'GeoJSON',
                        geojson: {
                            object:{
                                type: "FeatureCollection",
                                features: features
                            },
                            projection: 'EPSG:3857'
                        }
                    },
                    style: (function() {
                        var someStyle = [new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: 'blue'
                            }),
                            stroke: new ol.style.Stroke({
                                color: 'olive',
                                width: 1
                            })
                        })];
                        var otherStyle = function(r,c){ return [new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: r,
                                fill: new ol.style.Fill({
                                    color: c
                                })
                            })
                        })]};
                        return function(feature, resolution) {
                            if (feature.get('class') === "someClass") {
                                return someStyle;
                            } else {
                                return otherStyle(feature.get('radius'), feature.get('color'));
                            }
                        };
                    }())
                }
            });

        angular.extend($scope, {
            Africa: {
                lat: -6.45,
                lon: 35,
                zoom: 6
            },
            feat: {}
            ,facility:shared.facility
        });
        var url = 'https://dhis.moh.go.tz/api/geoFeatures.json?ou=ou:LEVEL-4;m0frOspS7JY&displayProperty=NAME&viewClass=detailed'

    })();
    /**
     *  THE END
     * */
}]);


/**
 * THE BEGINNING OF ANALYSIS CONTROLLER FUNCTION
 * */
portal.controller("analysisController",['$scope','$http','shared',function($scope,$http){

}]);


/**
 * THE BEGINNING OF DASHBOARDS CONTROLLER FUNCTION
 * */
portal.controller("dashboardController",['$scope','$http','shared',function($scope,$http){


    $scope.particularDashboard = function(dashboardId){
        //console.log(dashboardId);
        Ext.onReady( function() {
            Ext.Ajax.request({
                url: base + "dhis-web-commons-security/login.action?authOnly=true",
                method: 'POST',
                params: { j_username: "portal", j_password: "Portal123" },
                success: setLinks
            });
        });

        function setLinks(data) {
            var url = "portal-module/"+dashboardId+".json";
            $http({
                method: 'GET',
                url: url
            }).success(
                function(data) {
                    $scope.dashboardItems = data.dashboardItems;
                });
        }



    }

}]);


portal.factory('shared', function() {
    var shared = {
        "facility":0
    };
    return shared;
})
