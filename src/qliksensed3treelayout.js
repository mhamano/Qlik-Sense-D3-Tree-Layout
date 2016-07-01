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

    return {

        definition: props,
        initialProperties: initProps,

        snapshot: { canTakeSnapshot: true },

        //resize : function() {
            //do nothing
        //},

        // Paint Method
        paint: function ($element, layout) {

          if(layout.properties.defineScreenSize) {
            extensionUtils.addStyleToHeader("<style>div.qv-object-content-container {overflow: auto;}</style>");
          }

          var self = this;
          var app = qlik.currApp(this);

          if( layout.properties.nodeID && layout.properties.parentNodeID  && layout.properties.nodeName && layout.properties.measure) {
            app.createCube({
              qDimensions : [
                { qDef : {qFieldDefs: ["=" + layout.properties.nodeID]} },
                { qDef : {qFieldDefs: ["=" + layout.properties.parentNodeID]} },
                { qDef : {qFieldDefs: ["=" + layout.properties.nodeName]} }
              ],
              qMeasures : [
                { qDef : { qDef : "=" + layout.properties.measure } }
              ],
              qInitialDataFetch : [
                { qHeight : 1000, qWidth : 5 }
              ]
            }, function (reply) {
              createTreeStructuredData(reply, $element, layout.properties); });
          }

          // Create Tree
          function createTreeStructuredData(reply, $element, properties) {

            var qMatrix = reply.qHyperCube.qDataPages[0].qMatrix;

            var flat_data = qMatrix.map(function(d) {
              return {
                "id": d[0].qNum,
                "elemNum": d[0].qElemNumber,
                "parentId": d[1].qNum,
                "name": d[2].qText,
                "mea": d[3].qText
              }
            });

            var node_with_lowest_id = _.min(flat_data, function(d) {
              return d.id;
            });

            var root_node_id = node_with_lowest_id.id;

            var returnArrayOfAllChildNodes = function(parent_id, parent_array, depth) {
              var child_nodes = _.where(flat_data, {"parentId": parent_id});
              var child_nodes_array = [];
              depth++;

              if(child_nodes.length > 0) {
                for(var i=0; i<child_nodes.length; i++) {
                    var child_node = {
                      "id": child_nodes[i]["id"],
                      "elemNum": child_nodes[i]["elemNum"],
                      "name": child_nodes[i]["name"],
                      "parentId": child_nodes[i]["parentId"],
                      "mea": child_nodes[i]["mea"],
                      "depth": depth
                    };
                    child_nodes_array[i] = child_node;
                    returnArrayOfAllChildNodes(child_nodes[i]["id"], child_nodes_array[i], depth)
                }
                parent_array["children"] = child_nodes_array;
                return parent_array;
              } else {
                return parent_array;
              }
            }

            var rootNode = _.findWhere(flat_data, {"id": root_node_id});
            var top_depth = 0;
            var treeStructuredData = returnArrayOfAllChildNodes(root_node_id, rootNode, top_depth);

            renderChart(reply, $element, properties, treeStructuredData, flat_data);
          }

          // Render Chart
          function renderChart(reply, $element, properties, treeStructuredData, flat_data) {

            var object_id = reply.qInfo.qId;
            var $divContainer = $(document.createElement('div'));
            $divContainer.attr('id',object_id);
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

            var ext_width = 0, ext_height = 0;
            if (properties.defineScreenSize) {
                ext_width = properties.screenWidth;
                ext_height = properties.screenHight;
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
            var svg = d3.select("#" + object_id).append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            root = treeStructuredData;
            root.x0 = height / 2;
            root.y0 = 0;

            // Toggle children.
            function collapse(d) {
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else {
                d.children = d._children;
                d._children = null;
              }
            }

            function collapseAll(d) {
              if (d.children) {
                d.children.forEach(collapseAll);
                if(properties.defineCollapseLevel && d.depth>=properties.collapseLevel){
                  collapse(d);
                }
              }
            }

            if(!root.children){
              update(root);
            }
            else {
              root.children.forEach(collapseAll);
              update(root);
            }

            d3.select(self.frameElement).style("height", "800px");

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
                  .on("click", click);

              nodeEnter.append("text")
                  .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                  .attr("dy", ".35em")
                  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                  .text(function(d) { return d.name; })
                  .on("click", selection)
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
                  .attr("r", 4.5)
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
              toolTipContent.html(d.name);

              //placing tooltip near cursor
              toolTip.style("left", (d3.event.layerX + 20) + "px")
                     .style("top", (d3.event.layerY) + "px")
                     .style("left", d + "px")
                     .style("top", d + "px")
                     .style("z-index", 5);
            }
            // Toggle children on click.
            function click(d) {
              if (d.children) {
                d._children = d.children;
                d.children = null;
              } else {
                d.children = d._children;
                d._children = null;
              }
              update(d);
            }

            // selection
            function selection(d) {

              var dim = 0;
              var selected = [];

              selected.push(d.elemNum)

              function selectParentNodes(parent_id) {
                if(parent_id > 0) {
                  var parentNodes = _.where(flat_data, {"id": parent_id});
                  _.each(parentNodes, function(d) {
                    selectParentNodes(d.parentId);
                    selected.push(d.elemNum)
                  })
                } else {
                  //do nothing
                }
              }

              selectParentNodes(d.parentId);

              //Apply selection
              //self.selectValues( dim, selected , true );
              self.selectValues(dim, selected, true);
            }
          }
    } // (Paint Method)
  };// Return Method
});
