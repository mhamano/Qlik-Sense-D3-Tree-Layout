/*global define*/
define([], function () {
  'use strict';

  var dimensions = {
    uses: "dimensions",
    min: 0
  };

  var measures = {
    uses: "measures",
    min: 0
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
          defineMeasure: {
            ref: "properties.defineMeasure",
            label: "Display Measure",
            type: "boolean",
            component: "switch",
            options: [
              { value: true, label: "Activated" },
              { value: false, label: "Deactivated"}
            ],
            defaultValue: false
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
          clearAll: {
            ref: "properties.clearAll",
            label: "Clear Selections Before Finding Parent Nodes",
            type: "boolean",
            component: "switch",
            options: [
              { value: true, label: "Yes" },
              { value: false, label: "No"}
            ],
            defaultValue: true
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
            dimensions: dimensions,
            measures: measures,
            //sorting: sorting,
            //addons: addons,
            settings: settings,
            treeConfigurations: treeConfigurations

        }
    };

});
