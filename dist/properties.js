define([],function(){"use strict";var e={uses:"dimensions",min:0},l={uses:"measures",min:0},t={uses:"settings",items:{treeStructure:{type:"items",label:"Tree Structure Definition",items:{showMeasure:{ref:"properties.showMeasure",label:"Display Measure",type:"boolean",component:"switch",options:[{value:!0,label:"Activated"},{value:!1,label:"Deactivated"}],defaultValue:!1},circleRadiusSize:{type:"number",component:"slider",label:"Circle Radius Size",ref:"properties.circleRadius",min:0,max:10,step:1,defaultValue:4},fontSize:{type:"number",component:"slider",label:"Font Size",ref:"properties.fontSize",min:0,max:20,step:1,defaultValue:10},selectionMode:{type:"string",component:"dropdown",label:"Selection Mode ",ref:"properties.selectionMode",options:[{value:"parent",label:"All Parent Nodes"},{value:"child",label:"All Child Nodes"},{value:"selected",label:"Only Selected Node"}],defaultValue:"parent"},clearAll:{ref:"properties.clearAll",label:"Clear Selections Before Finding Parent Nodes",type:"boolean",component:"switch",options:[{value:!0,label:"Yes"},{value:!1,label:"No"}],defaultValue:!0},defineScreenSize:{ref:"properties.defineScreenSize",label:"Define Screen Size",type:"boolean",component:"switch",options:[{value:!0,label:"Custom"},{value:!1,label:"Auto"}],defaultValue:!1},screenHight:{ref:"properties.screenHight",label:"Screen Height",type:"integer",defaultValue:960,show:function(e){return e.properties.defineScreenSize}},screenWidth:{ref:"properties.screenWidth",label:"Screen Width",type:"integer",defaultValue:800,show:function(e){return e.properties.defineScreenSize}},defineCollapseLevel:{ref:"properties.defineCollapseLevel",label:"Define a Default Collapse Level",type:"boolean",component:"switch",options:[{value:!0,label:"Activated"},{value:!1,label:"Deactivated"}],defaultValue:!1},collapseLevel:{ref:"properties.collapseLevel",label:"Default Collapse Level",type:"integer",expression:"",defaultValue:3,show:function(e){return e.properties.defineCollapseLevel}}}}}};return{type:"items",component:"accordion",items:{dimensions:e,measures:l,settings:t}}});