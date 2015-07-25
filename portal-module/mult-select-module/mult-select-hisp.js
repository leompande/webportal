
var multHisp =angular
    .module('multSelectHisp', []);


multHisp.directive('multiSelectHisp',function(){
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
                            if(valueI.uid==value){
                                $scope.myOptionAvailable.splice(index,1);
                                $scope.Items.splice(indexI,1);
                                $scope.myOptionSelected=[];
                                $scope.Selects.push(valueI);
                                angular.forEach($scope.Selects,function(valueS,indexS){
                                    $scope.myOptionSelected.push(valueS.uid);
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
                            if(valueI.uid==value){
                                $scope.myOptionSelected.splice(index,1);
                                $scope.Selects.splice(indexI,1);
                                $scope.myOptionAvailable=[];
                                $scope.myOptionAvailable.push(value);
                                $scope.Items.push(valueI);
                                angular.forEach($scope.Items,function(valueS,indexS){
                                    $scope.myOptionAvailable.push(valueS.uid);
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
                            $scope.myOptionSelected.push(value.uid);
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
                            $scope.myOptionAvailable.push(value.uid);
                        });
                        $scope.Selects = {};
                        $scope.myOptionSelected =[];
                    }
                    var available_selection = angular.element(document.querySelector('#available_selection'));

                });

            });

            $scope.availableAction = function(){
            }

            $scope.selectedAction = function(){
            }

        },
        scope: {
            Items: "=itemlist",
            Selects: "=ItemsSelected",
            collection: "=collection"
        },
        restrict:"E",
        templateUrl:"portal-module/mult-select-directive.html"
    }
});