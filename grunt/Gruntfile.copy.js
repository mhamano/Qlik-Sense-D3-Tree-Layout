/*global module*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-copy');
    return {
        options: {
          processContentExclude: ['**/*.{png,gif,jpg,ico,psd}']
        },
        copy_to_dist: {
            expand: true,                   // allow dynamic building
            cwd: '../src/',                 // change base dir
            //src: ['**', '!docs/**'],      // source files mask
            src: ['**'],
            dest: '../dist/',               // destination folder
            flatten: false                  // remove all unnecessary nesting
        },
        copy_to_desktop: {
            expand: true,
            cwd: '../dist/',
            src: '**',
            dest: '<%= projectConfig.general.LocalExtensionPath%>/<%= projectConfig.general.ExtensionNameSafe%>/'
        }
    };
};
