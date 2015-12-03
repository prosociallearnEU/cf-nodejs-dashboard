'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //Compress
        compress: {
          main: {
            options: {
              archive: './target/<%= grunt.template.today("yyyy-mm-dd") %>-cf-nodejs-dashboard-SNAPSHOT.zip'
            },
            files: [
              {src: ['public/**'], dest: '.'},
              {src: ['routes/**'], dest: '.'},
              {src: ['services/**'], dest: '.'},
              {src: ['public/**'], dest: '.'},
              {src: ['uploads/**'], dest: '.'},
              {src: ['views/**'], dest: '.'},
              {src: ['.cfignore','index.js','manifest.yml','package.json','README.md','LICENCE'], dest: '.'}
           ]
          }
        }      
    });

    //Dependencies
    grunt.loadNpmTasks('grunt-contrib-compress');

    //Task definition
    grunt.registerTask('default', 'compress');
};
