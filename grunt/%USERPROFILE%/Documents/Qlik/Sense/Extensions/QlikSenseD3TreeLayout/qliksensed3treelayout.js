/*global
            define,
            require,
            window,
            console,
            _
*/
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

        resize : function() {
            //do nothing
        },

        // Paint Method
        paint: function ($element, layout) {

          var app = qlik.currApp(this);

          if( layout.properties.nodeID && layout.properties.parentNodeID  && layout.properties.nodeName && layout.properties.measure)　{
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
              createTreeStructuredData(reply, $element); });
            }
        } // (Paint Method)
    };
});

//
function createTreeStructuredData(reply, $element) {

  var qMatrix = reply.qHyperCube.qDataPages[0].qMatrix;
  var rootNodeID = 0;

  var rawData = qMatrix.map(function(d) {
    return {
      "id": d[0].qNum,
      "elemNum": d[0].qElemNumber,
      "parentId": d[1].qNum,
      "name": d[2].qText,
      "mea": d[3].qText
    }
  });

  var returnArrayOfAllChildNodes = function(parentID, parentArray) {
    var childNodes = _.where(rawData, {"parentId": parentID});
    var resultArr = [];

    if(childNodes.length > 0) {
      for(var i=0; i<childNodes.length; i++) {
          var childNode = {
            "id": childNodes[i]["id"],
            "elemNum": childNodes[i]["elemNum"],
            "name": childNodes[i]["name"],
            "parentId": childNodes[i]["parentId"],
            "mea": childNodes[i]["mea"]
          };
          resultArr[i] = childNode;
          console.log(childNodes[i]["id"], resultArr[i])
          returnArrayOfAllChildNodes(childNodes[i]["id"], resultArr[i])
      }
      parentArray["children"] = resultArr;
      return parentArray;
    } else {
        return parentArray;
    }
  }

  var rootNode = _.where(rawData, {"id": rootNodeID})[0];
  var treeStructuredData = returnArrayOfAllChildNodes(rootNodeID, rootNode);

  renderChart(reply, $element, treeStructuredData);
}

// Render Chart
function renderChart(reply, $element, treeStructuredData) {

  var object_id = reply.qInfo.qId;
  var $divContainer = $(document.createElement('div'));
  $divContainer.attr('id',object_id);
  $divContainer.addClass('divTemplateContainer');
  $element.empty();
  $element.append($divContainer);

  //Update Extension info with the containers position
  var position = document.getElementById(object_id).getBoundingClientRect();

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

  var margin = {top: 20, right: 120, bottom: 20, left: 120},
      width = 960 - margin.right - margin.left,
      height = 800 - margin.top - margin.bottom;

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


  // Recieve json data
  var base = requirejs.s.contexts._.config.baseUrl + requirejs.s.contexts._.config.paths.extensions
  var url = base + "/qliksensed3treelayout/lib/data/flare.json";

  // Read Jason
  // d3.json(url, function(error, treeStructuredData) {
  //   if (error) throw error;
  //
  //   root = flare;
  //   root.x0 = height / 2;
  //   root.y0 = 0;
  //
  //   function collapse(d) {
  //     if (d.children) {
  //       d._children = d.children;
  //       d._children.forEach(collapse);
  //       d.children = null;
  //     }
  //   }
  //
  //   root.children.forEach(collapse);
  //   update(root);
  //
  //   // function collapseAll(d) {
  //   //   if (d.children) {
  //   //     //d.children.forEach(collapseAll);
  //   //     //console.log(d)
  //   //     //if(treeProperties.treeLayout.typeOfLeaf=="Circle" &&treeProperties.treeStructure.defineCollapseLevel && d.depth>=treeProperties.treeStructure.collapseLevel){
  //   //         if (d.depth >= 0) {
  //   //           //collapse(d);
  //   //         }
  //   //       }
  //   // }
  //   //
  //   // if(!root.children){
  //   //   update(root);
  //   // } else {
  //   //   root.children.forEach(collapseAll);
  //   //   update(root);
  //   // }
  //
  // });

  root = treeStructuredData;
  root.x0 = height / 2;
  root.y0 = 0;

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  root.children.forEach(collapse);
  update(root);


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
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("mouseover", function(d) { node_onMouseOver(d); })
        .on("mouseout", function(d) {
            toolTip.transition()									// declare the transition properties to fade-out the div
                    .duration(500)									// it shall take 500ms
                    .style("opacity", "0");							// and go all the way to an opacity of nil
            })
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
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
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
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
        .attr("d", function(d) {
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
        .attr("d", function(d) {
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
    toolTip.style("left", (d3.event.pageX-position.left+20) + "px")
           .style("top", (d3.event.pageY-position.top) + "px")
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
}
