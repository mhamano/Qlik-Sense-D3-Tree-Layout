/*global define*/
define([], function () {
  'use strict';

  var dimensions = {
		type: "items",
		label: "Dimensions",
		ref: "qListObjectDef",
		min: 1,
		max: 1,
		show: false,
		items: {
			label: {
				type: "string",
				ref: "qListObjectDef.qDef.qFieldLabels.0",
				label: "Label",
				show: true
			},
			libraryId: {
				type: "string",
				component: "library-item",
				libraryItemType: "dimension",
				ref: "qListObjectDef.qLibraryId",
				label: "Dimension",
				show: function ( data ) {
					return data.qListObjectDef && data.qListObjectDef.qLibraryId;
				}
			},
			field: {
				type: "string",
				expression: "always",
				expressionType: "dimension",
				ref: "qListObjectDef.qDef.qFieldDefs.0",
				label: "Node Name",
				show: function ( data ) {
					return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
				}
			}
		}
	};


    var sorting = {
        uses: "sorting"
    };

    var settings = {
        uses: "settings"
    };

    var treeConfigurations = {
      type: "items",
      component: "expandable-items",
      label: "Tree Configuration",
      items: {
        treeStructure:{
          type: "items",
          label: "Tree Structure Definition",
          items: {
            parentNodeID: {
              ref: "properties.parentNodeID",
              label: "Parent Node ID",
              type: "string",
              expression: ""
            },
            nodeID: {
              ref: "properties.nodeID",
              label: "Node ID",
              type: "string",
              expression: ""
            },
            nodeName: {
              ref: "properties.nodeName",
              label: "Node Name",
              type: "string",
              expression: ""
            },
            defineMeasure: {
              ref: "properties.defineMeasure",
              label: "Define Measure",
              type: "boolean",
              component: "switch",
              options: [
                { value: true, label: "Activated" },
                { value: false, label: "Deactivated"}
              ],
              defaultValue: false
            },
            measure: {
              ref: "properties.measure",
              label: "Measure",
              type: "string",
              expression: "",
              show: function( data ){ return data.properties.defineMeasure; }
            },
            circleRadiusSize: {
                type: "number",
                component: "slider",
                label: "Circle Radius Size",
                ref: "properties.circleRadius",
                min: 0,
                max: 10,
                step: 1,
                defaultValue: 4
            },
            fontSize: {
                type: "number",
                component: "slider",
                label: "Font Size",
                ref: "properties.fontSize",
                min: 0,
                max: 20,
                step: 1,
                defaultValue: 10
            },
            defineScreenSize: {
              ref: "properties.defineScreenSize",
              label: "Define Screen Size",
              type: "boolean",
              component: "switch",
              options: [
                { value: true, label: "Custom" },
                { value: false, label: "Auto"}
              ],
              defaultValue: false
            },
            screenHight: {
              ref: "properties.screenHight",
              label: "Screen Height",
              type: "integer",
              defaultValue: 960,
              show: function( data ){ return data.properties.defineScreenSize; }
            },
            screenWidth: {
              ref: "properties.screenWidth",
              label: "Screen Width",
              type: "integer",
              defaultValue: 800,
              show: function( data ){ return data.properties.defineScreenSize; }
            },
            defineCollapseLevel: {
              ref: "properties.defineCollapseLevel",
              label: "Define a Default Collapse Level",
              type: "boolean",
              component: "switch",
              options: [
                { value: true, label: "Activated" },
                { value: false, label: "Deactivated"}
              ],
              defaultValue: false
            },
            collapseLevel: {
              ref: "properties.collapseLevel",
              label: "Default Collapse Level",
              type: "integer",
              expression: "",
              defaultValue: 3,
              show: function( data ){ return data.properties.defineCollapseLevel; }
            }
          }
        }
      }
    }


    // Return values
    return {
        type: "items",
        component: "accordion",
        items: {
            treeConfigurations: treeConfigurations,
            dimensions: dimensions,
            //measures: measures,
            sorting: sorting,
            //addons: addons,
            settings: settings

        }
    };

});
