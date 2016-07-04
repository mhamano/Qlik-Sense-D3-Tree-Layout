/*jslint    devel:true,
            white: true
 */
define([
        'js/qlik',
        'jquery',
        'underscore',
        './qliksensed3treelayout-properties',
        './qliksensed3treelayout-initialproperties',
        './lib/js/extensionUtils',
        'text!./lib/css/style.css',
        './lib/js/d3.v3.min'
],
function (qlik, $, _, props, initProps, extensionUtils, cssContent, d3) {
    'use strict';

    extensionUtils.addStyleToHeader(cssContent);

    var selected = [], parent_id = null, my_id = null; // When made a selection by clicking on a node text, selected node's elemNum and parent_is are stored.

    return {

        definition: props,
        initialProperties: initProps,

        snapshot: { canTakeSnapshot: true },

        //resize : function() {
            //do nothing
        //},

        // Paint Method
        paint: function ($element, layout) {

          // Instruction is displayed when dimensions and measure are not set. 
          if(layout.qHyperCube.qDimensionInfo.length < 3 || layout.qHyperCube.qMeasureInfo.length < 1)
            {
              var html_text = '<h1 style="font-size: 150%;">This extension requires 3 dimensions and 1 measure to define the Tree Structure.</h1>';
              html_text +='<br />Dimensions:<br /><br />';
              html_text +='<b style="color: #1A8C27">Node ID:</b> Numeric ID uniquely identifies each node.<br />';
              html_text +='<b style="color: #1A8C27">Parent ID:</b> Numeric ID of the parent node.<br />';
              html_text +='<b style="color: #1A8C27">Node Name:</b> Display name of each node.<br />';
              html_text +='<br /><br />Measure:<br /><br />';
              html_text +='<b style="color: #1A8C27">Measure:</b>  This is a measure value which is displayed beside each node name on the tree. You can optionally input "Sum(1)" here and switch off "Display Measure" property to hide this measure value.<br /><br />';
              $element.html(html_text);
              return null;
            }

          // When showMeasure switch is ON, scroll bar is displayed.
          if(layout.properties.defineScreenSize) {
            extensionUtils.addStyleToHeader("<style>div.qv-object-content-container {overflow: auto;}</style>");
          }

          var self = this;
          var app = qlik.currApp(this);
          var extension_object_id = layout.qInfo.qId;
          var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;

          // Flatten the qMatrix into an array
          var flatten_data = qMatrix.map(function(d) {
            return {
              "id": d[0].qNum,
              "elemNum": d[0].qElemNumber,
              "parent_id": d[1].qNum,
              "name": d[2].qText,
              "mea": d[3].qText
            }
          });

          // Select all parent nodes
          function selectParentNodes(parent_id) {
            if(parent_id > 0) {
              var parentNodes = _.where(flatten_data, {"id": parent_id});
              _.each(parentNodes, function(d) {
                selectParentNodes(d.parent_id);
                selected.push(d.elemNum)
              })
            } else {
              //do nothing
            }
          }

          // Select all child nodes
          function selectChildNodes(my_id) {
            if(my_id > 0) {
              var childNodes = _.where(flatten_data, {"parent_id": my_id});
              _.each(childNodes, function(d) {
                selectChildNodes(d.id);
                selected.push(d.elemNum)
              })
            } else {
              //do nothing
            }
          }

          // Make selections when selection data is stored in the "selected" array.
          if(selected && selected.length > 0) {
            // Select parents or child nodes depends on the selectionMode property settings
            if (layout.properties.selectionMode == "parent" && parent_id) {
              selectParentNodes(parent_id);
            } else if (layout.properties.selectionMode == "child" && my_id ) {
              selectChildNodes(my_id);
            } else {
              // do nothing
            }

            //Apply selections
            var dim = 0;
            self.backendApi.selectValues(dim, selected, true);

            selected = [], parent_id = null; // Reset selections
            self.paint($element, layout); // Repaint the extension
          }

          // Get the node with lowest id as the top node.
          // The hierarchy has only one top node, so when there are multiple top nodes,
          // only node with lowest id and its childlen are displayed.
          var node_with_lowest_id = _.min(flatten_data, function(d) {
            return d.id;
          });
          var root_node_id = node_with_lowest_id.id;

          // This function recursively return nodes on the lower hierachical level.
          // This is used to create hierachycal data.
          var returnArrayContainingAllChildNodes = function(parent_id, parent_array, depth) {
            var child_nodes = _.where(flatten_data, {"parent_id": parent_id});
            var child_nodes_array = [];
            depth++;

            if(child_nodes.length > 0) {
              for(var i=0; i<child_nodes.length; i++) {
                  var child_node = {
                    "id": child_nodes[i]["id"], //NodeID
                    "elemNum": child_nodes[i]["elemNum"], // ElemNum of NodeID
                    "name": child_nodes[i]["name"], // NodeName
                    "parent_id": child_nodes[i]["parent_id"], //ParentNodeID
                    "mea": child_nodes[i]["mea"], // Measure
                    "depth": depth // Depth
                  };
                  child_nodes_array[i] = child_node;
                  returnArrayContainingAllChildNodes(child_nodes[i]["id"], child_nodes_array[i], depth)
              }
              parent_array["children"] = child_nodes_array;
              return parent_array;
            } else {
              return parent_array;
            }
          } // End of returnArrayContainingAllChildNodes

          var rootNode = _.findWhere(flatten_data, {"id": root_node_id});
          var top_depth = 0;
          var hierarchical_data = returnArrayContainingAllChildNodes(root_node_id, rootNode, top_depth);

          // Define container for this extension
          var $divContainer = $(document.createElement('div'));
          $divContainer.attr('id',extension_object_id);
          $divContainer.addClass('divTemplateContainer');
          $element.empty();
          $element.append($divContainer);

          //Create Tooltip for additional information display when over the node
          var $divToolTip = $(document.createElement('div'));
          $divToolTip.attr('id', 'tooltip');

          $divToolTip.css({
                  backgroundColor: 'white',
                  color: '#000',
                  opacity:0,
                  position: 'absolute',
                  border: '1px solid #dbdbdb'
                    });
          $divContainer.append($divToolTip);

          var $divToolTipContent = $(document.createElement('div')); //contents configuration
          $divToolTipContent.attr('id', 'tooltipcontent');
          $divToolTipContent.css({
                color: '#000',
                font: '11px sans-serif',
                "text-align": "left",
                "padding": "7px"
              });
          $divToolTipContent.html('content here');
          $divToolTip.append($divToolTipContent);

          var toolTip = d3.select('#tooltip');
          var toolTipContent = d3.select('#tooltipcontent');

          // Define width and hight of this extension
          var ext_width = 0, ext_height = 0;
          if (layout.properties.defineScreenSize) {
              ext_width = layout.properties.screenWidth;
              ext_height = layout.properties.screenHight;
          } else {
              ext_width = $element.width();
              ext_height = $element.height();
          }

          var margin = {top: 20, right: 120, bottom: 20, left: 120},
              width = ext_width - margin.right - margin.left,
              height = ext_height - margin.top - margin.bottom;

          var i = 0,
              duration = 750,
              root;

          // Define tree and diagonal layout
          var tree = d3.layout.tree()
              .size([height, width]);

          var diagonal = d3.svg.diagonal()
              .projection(function(d) { return [d.y, d.x]; });

          // Select SVG element
          var svg = d3.select("#" + extension_object_id).append("svg")
              .attr("width", width + margin.right + margin.left)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          root = hierarchical_data;
          root.x0 = height / 2;
          root.y0 = 0;

          // Collapse child nodes.
          function collapse(d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
          }

          // Collapse all child nodes
          function collapseAll(d) {
            if (d.children) {
              d.children.forEach(collapseAll);
              if(layout.properties.defineCollapseLevel && d.depth>=layout.properties.collapseLevel){
                collapse(d);
              }
            }
          }

          // Collapse child nodes when root data includes children. Then update the tree layout.
          if(!root.children){
            update(root);
          }
          else {
            root.children.forEach(collapseAll);
            update(root);
          }

          d3.select(self.frameElement).style("height", "800px");

          // Update the tree sdlayout
          function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 180; });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function() { return "translate(" + source.y0 + "," + source.x0 + ")"; });

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
                .on("click", eventCollapseChild);

            nodeEnter.append("text")
                .attr("x", function(d) { return d.children || d._children ? -10 - ((layout.properties.circleRadius-4) / 2) : 10 + ((layout.properties.circleRadius-4) / 2); })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .style("font-size", layout.properties.fontSize + "px")
                .text(function(d) {
                    if (layout.properties.showMeasure) {
                      return d.name + ": " + d.mea;
                    } else {
                      return d.name;
                    }
                })
                .on("click", eventMakeSelection)
                .on("mouseover", function(d) { node_onMouseOver(d); })
                .on("mouseout", function() {
                    toolTip.transition()									// declare the transition properties to fade-out the div
                            .duration(500)									// it shall take 500ms
                            .style("opacity", "0");							// and go all the way to an opacity of nil
                  })
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", layout.properties.circleRadius)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function() { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function() {
                  var o = {x: source.x0, y: source.y0};
                  return diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function() {
                  var o = {x: source.x, y: source.y};
                  return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
              d.x0 = d.x;
              d.y0 = d.y;
            });
          }

          //Mouse houver behavior
          function node_onMouseOver(d) {
            toolTip.transition()
            .duration(200)
            .style("opacity", ".85");

            if (layout.properties.showMeasure) {
              toolTipContent.html(d.name + ":" + d.mea);
            } else {
              toolTipContent.html(d.name);
            }

            //placing tooltip near cursor
            toolTip.style("left", (d3.event.layerX + 20) + "px")
                   .style("top", (d3.event.layerY) + "px")
                   .style("left", d + "px")
                   .style("top", d + "px")
                   .style("z-index", 5);
          }

          // Collapse clild nodes by clicking a circle.
          function eventCollapseChild(d) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            update(d);
          }

          // Make Selections by clicking a node text.
          function eventMakeSelection(d) {
            selected.push(d.elemNum) // Store clicked node's elemNum to "selected" array.

            if (layout.properties.selectionMode == "parent") {
                parent_id = d.parent_id;
            } else if (layout.properties.selectionMode == "child" ) {
                my_id = d.id;
            } else {
              // do nothing
            }

            if (layout.properties.clearAll) {
              //clear selections
              app.clearAll();
              self.paint($element);
            } else {
              self.paint($element, layout)
            }
          }

    } // (Paint Method)
  };// Return Method
});
