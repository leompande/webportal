// https://github.com/Gillardo/bootstrap-ui-treeview
// Version: 1.0.0
// Released: 2015-03-13 
angular.module('ui.bootstrap.treeview', []).factory('TreeViewService', function () {
    var factory = {};

    factory.selectedNode = null;
    factory.selectedNodeMultiple =[];

    factory.unselectNode = function () {
        if (factory.selectedNode) factory.selectedNode.selected = undefined;

        factory.selectedNode = null;
    };

    factory.selectNode = function (node,$event) {

        if (factory.selectedNode){
            if($event.ctrlKey){
                factory.selectedNodeMultiple.push(factory.selectedNode);
                factory.selectedNodeMultiple.push(node);
            }else{
                factory.selectedNode.selected = undefined;
                angular.forEach(factory.selectedNodeMultiple,function(value,index){
                    factory.selectedNode = value;
                    factory.selectedNode.selected = undefined;

                });
                factory.selectedNodeMultiple = [];
                factory.selectedNode = node;
            }
        }else{
            factory.selectedNode = node;
        }


        node.selected = true;
    };


    factory.toggleNode = function (node) {
        // no node selected
        if (!node) return;

        // no children
        if (!node.children) return;

        // collapse / expand
        if (node.children && node.children.length > 0) {
            node.collapsed = !node.collapsed;
        }
    };

    factory.toggleAll = function (node) {
        // no node selected
        if (!node) return;

        // set all children equal to what the parent will be, 
        // else can get out of sync
        var collapsed = !node.collapsed;

        var iterate = function (child) {
            if (!child.children) {
                return null;
            } else {
                child.collapsed = collapsed;

                for (var i = 0; i < child.children.length; i++) {
                    iterate(child.children[i]);
                }
            }
        };

        if (node) {
            iterate(node);
        }
        
    };

    return factory;
});
angular.module('ui.bootstrap.treeview').directive('treeView', ['$compile', 'TreeViewService', function ($compile, TreeViewService) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var model = attrs.treeView;
            var isRoot = (!attrs.treeRoot ? true : false);
            var nodeLabel = attrs.nodeLabel || 'label';
            var itemInclude = attrs.itemNgInclude || '';
            var itemIncludeHtml = '';

            if (itemInclude && itemInclude.length > 0) {
                itemIncludeHtml = '<div ng-include="\'' + attrs.itemNgInclude + '\'"></div>'
            }

            // template
            var template =
                '<ul class="tree-view">' +
                    '<li ng-repeat="node in ' + model + '">' +
                        '<div>' +
                            '<div>' +
                                '<i ng-click="toggleNode(node)" ng-show="node.children && node.children.length > 0" ng-class="!node.collapsed ? \'has-child\' : \'has-child-open\'"></i>' +
                                '<i ng-click="toggleNode(node)" class="no-child" ng-show="!node.children || node.children.length == 0"></i>' +
                                '<span ng-click="selectNode(node,$event)" ng-bind="node.' + nodeLabel + '" ng-class="{\'selected\' : node.selected}"></span>' +
                            '</div>' +
                            itemIncludeHtml +
                        '</div>' +
                        '<div class="tree-view" collapse="!node.collapsed" tree-view="node.children" tree-root="false" node-label="' + nodeLabel + '" item-ng-include="' + itemInclude + '" ></div>' +
                    '</li>' +
                '</ul>';

            // root node
            if (isRoot) {

                // toggle when icon clicked
                scope.toggleNode = function (node) {
                    TreeViewService.toggleNode(node);

                };

                // select when name clicked
                scope.selectNode = function (node,$event) {
                    TreeViewService.selectNode(node,$event);
                };

                scope.trapKeyEvent = function ($event) {
                    TreeViewService.trapKeyEvent($event);
                };

            }

            var compiledHtml = $compile(template)(scope);

            elem.append(compiledHtml);
        }
    };
}]);