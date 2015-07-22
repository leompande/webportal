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
portal.controller("analysisController",['$scope','$http','shared',function($scope,$http){

}]);


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
