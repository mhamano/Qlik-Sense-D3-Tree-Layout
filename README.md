# Qlik-Sense-D3-Tree-Layout

## Purpose and Description
This is a Qlik Sense Extension which displays a hierarchical node tree using D3.js. This is originally created for a demo app of supply chain risk management to visualize the dependency of multi-tiered suppliers and supplied products. This extension is tested on Qlik Sense 3.0.

## Screenshots

![Alt text](./src/lib/images/sample.png)

## Installation

1. Download the [latest version](./build/release/)
2. Qlik Sense Desktop
	* To install, copy all files in the .zip file to folder "C:\Users\[%Username%]\Documents\Qlik\Sense\Extensions\Qlik-Sense-D3-Tree-Layout"
3. Qlik Sense Server
	* See instructions [how to import an extension on Qlik Sense Server](http://help.qlik.com/sense/en-us/developer/#../Subsystems/Workbench/Content/BuildingExtensions/HowTos/deploy-extensions.htm)

## Configuration
This extension includes the following configurable settings:

 * Display Measure - When this switch is activated, measure is displayed on the right side of the node name on the tree.
 * Circle Radius Size - This is for adjusting the circle radius size representing each node.
 * Font Size - This is for adjusting the font size of each node text.
 * Selection Mode - You can choose selection behaviors when you click a node text. When you select "All Parent Nodes" or "All Child Nodes", all parent/child nodes are selected by clicking a node text.  
 * Clear Selections Before Finding Parent/Child Nodes - When this option is enabled, all parent/child nodes are selected after current selections are cleared. When this option is disabled, parent/child node selections are made in the current selections.
 * Define Screen Size - When "Auto" is selected, the width/height of the tree are adjusted to the extension area size. By selecting "Custom", you can specify the size of the extension.
 * Define a Default Collapse Level - When activated, you can specify the depth of the default collapse level.

## Author

**Masaki Hamano**
* http://github.com/mhamano

Thanks to the following community projects, which this extension is built upon.

* [D3DynamicTreeLayout-QS](http://branch.qlik.com/#!/project/56728f52d1e497241ae698bd) by Renato Vieira
* [Collapsible Tree](http://bl.ocks.org/mbostock/4339083) by Mike Bostock

## Change Log

See [CHANGELOG](CHANGELOG.yml)

## License & Copyright
The software is made available "AS IS" without any warranty of any kind under the MIT License (MIT).

See [Additional license information for this solution.](LICENSE.md)
