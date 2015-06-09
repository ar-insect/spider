'use strict';

module.exports = function(grunt) {

    var transport = require('grunt-cmd-transport');
    var style = transport.style.init(grunt);
    var text = transport.style.init(grunt);
    var script = transport.script.init(grunt);
    var bootstrapGenerateCommonJSModule = require('./grunt/bootstrap-bs-commonjs-generator.js');
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg : grunt.file.readJSON('package.json'),
        banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        copy : {
            // assets 为静态文件的目录，存放编译打包后的js&css
            // 为了避免transport解析错误凡是在alias中配置的需要事先cp到assets下面
            sea: {
                files : [{
                    expand : true,
                    cwd : 'lib/',
                    src : ['sea.js', 'seajs-style/**'],
                    dest : 'assets'
                }]
            },
            $ : {
                files : [{
                    expand : true,
                    cwd : 'lib/',
                    src : ['$.js', '$-2.1.1.js'],
                    dest : 'assets'
                }]
            },
            bootstrap: {
                files : [{
                    expand : true,
                    cwd : 'lib/',
                    src : [
                        'bootstrap/3.3.2/js/transition.js',
                        'bootstrap/3.3.2/js/alert.js',
                        'bootstrap/3.3.2/js/button.js',
                        'bootstrap/3.3.2/js/carousel.js',
                        'bootstrap/3.3.2/js/collapse.js',
                        'bootstrap/3.3.2/js/dropdown.js',
                        'bootstrap/3.3.2/js/modal.js',
                        'bootstrap/3.3.2/js/tooltip.js',
                        'bootstrap/3.3.2/js/popover.js',
                        'bootstrap/3.3.2/js/scrollspy.js',
                        'bootstrap/3.3.2/js/tab.js',
                        'bootstrap/3.3.2/js/affix.js'
                    ],
                    dest : 'assets'
                }]
            },
            highlight : {
                files : [{
                    expand : true,
                    cwd : 'lib/',
                    src : ['highlight/8.3/styles/*.css', 'highlight/8.3/highlight.pack.js'],
                    dest : 'assets'
                }]
            },
            cellula : {
                files : [{
                    expand : true,
                    cwd : 'lib/',
                    src : ['cellula/0.4.2/*.js'],
                    dest : 'assets'
                }]
            },
            fdp : {
                files : [{
                    expand : true,
                    cwd : 'lib/',
                    src : ['fdp/**/*.js'],
                    dest : 'assets'
                }]
            },
            commonjs: {
                files : [{
                    expand : true,
                    cwd : 'static/js/',
                    src : ['common/**/*.js'],
                    dest : 'assets'
                }]
            }
        },
        transport : {
            options : {
                debug : false,
                alias : '<%= pkg.alias %>',
                parsers : {
                    '.js' : [script.jsParser],
                    '.css' : [style.css2jsParser]
                },
                paths : ['assets']
            },
            cellula : {
                options : {
                    idleading : 'cellula/0.4.2/'
                },
                files : [{
                    expand : true,
                    filter : 'isFile',
                    cwd : 'lib/cellula/0.4.2',
                    src : '*.js',
                    dest : 'assets/cellula/0.4.2'
                }]
            },
            fdp: {
                options : {
                    idleading : 'fdp/1.1.0/'
                },
                files : [{
                    expand : true,
                    filter : 'isFile',
                    cwd : 'lib/fdp/1.1.0',
                    src : '*.js',
                    dest : 'assets/fdp/1.1.0'
                }]
            }
        },
        less: {
            bootstrap_compileCore: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: 'bootstrap.css.map',
                    sourceMapFilename: 'assets/bootstrap/3.3.2/bootstrap.css.map'
                },
                src: 'lib/bootstrap/3.3.2/less/bootstrap.less',
                dest: 'assets/bootstrap/3.3.2/bootstrap-debug.css'
            },
            bootstrap_compileTheme: {
                options: {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: 'bootstrap-theme.css.map',
                    sourceMapFilename: 'assets/bootstrap/3.3.2/bootstrap-theme.css.map'
                },
                src: 'lib/bootstrap/3.3.2/less/theme.less',
                dest: 'assets/bootstrap/3.3.2/bootstrap-theme-debug.css'
            }
        },
        autoprefixer: {
            options: {
                browsers: [
                    "Android 2.3",
                    "Android >= 4",
                    "Chrome >= 20",
                    "Firefox >= 24",
                    "Explorer >= 8",
                    "iOS >= 6",
                    "Opera >= 12",
                    "Safari >= 6"
                ]
            },
            bootstrap_core: {
                options: {
                    map: true
                },
                src: 'assets/bootstrap/3.3.2/bootstrap-debug.css'
            },
            bootstrap_theme: {
                options: {
                    map: true
                },
                src: 'assets/bootstrap/3.3.2/bootstrap-theme-debug.css'
            }
        },
        css_import: {
            compress: {
                files: {
                    'assets/global/1.0.0/index.css': ['static/css/global/1.0.0/index.css'],

                }
            }
        },
        cssmin: {
            options: {
                //keepSpecialComments: 0
            },
            minify: {
                expand: true,
                cwd: 'assets/',
                src: ['global/**/index.css'],
                dest: 'assets/',
                ext: '.css'
            },
            compress: {
                files: {
                    'assets/gmu/2.1.0/gmu.css': [
                        'lib/gmu/assets/reset.css',
                        'lib/gmu/assets/widget/toolbar/toolbar.css',
                        'lib/gmu/assets/widget/toolbar/toolbar.default.css',
                        'lib/gmu/assets/widget/popover/popover.css',
                        'lib/gmu/assets/widget/popover/popover.default.css',
                        'lib/gmu/assets/widget/button/button.css',
                        'lib/gmu/assets/widget/button/button.default.css'
                    ]
                }
            },
            foundation: {
                src: 'assets/foundation/5.5.0/foundation-debug.css',
                dest: 'assets/foundation/5.5.0/foundation.css'
            },
            bootstrap_minifyCore: {
                src: 'assets/bootstrap/3.3.2/bootstrap-debug.css',
                dest: 'assets/bootstrap/3.3.2/bootstrap.css'
            },
            bootstrap_minifyTheme: {
                src: 'assets/bootstrap/3.3.2/bootstrap-theme-debug.css',
                dest: 'assets/bootstrap/3.3.2/bootstrap-theme.css'
            }
        },
        csscomb: {
            options: {
            },
            bootstrap: {
                options: {
                    config: 'less/.csscomb.json'
                },
                expand: true,
                cwd: 'assets/bootstrap/3.3.2',
                src: ['*.css', '!*-debug.css'],
                dest: 'assets/bootstrap/3.3.2/'
            },
            foundation: {
                files: {
                    'assets/foundation/5.5.0/foundation-debug.css': ['lib/foundation/5.5.0/css/normalize.css', 'lib/foundation/5.5.0/css/foundation.css']
                }
            }
        },
        concat : {
            options : {
                paths : ['.'],
                separator: ';'
            },
            cellula: {
                files : {
                    'assets/cellula/0.4.2/cellula.js': ['assets/cellula/0.4.2/*.js']
                }
            },
            fdp : {
                files : {
                    'assets/fdp/1.1.0/fdp.js': ['assets/fdp/1.1.0/*.js']
                }
            },
            gmu: {
                options : {
                    noncmd: true
                },
                files: {
                    'assets/gmu/2.1.0/gmu.js': [
                        'lib/gmu/dist/zepto.js',
                        'lib/gmu/src/extend/touch.js',
                        'lib/gmu/src/extend/offset.js',
                        'lib/gmu/src/extend/parseTpl.js',
                        'lib/gmu/src/extend/fix.js',
                        'lib/gmu/src/core/gmu.js',
                        'lib/gmu/src/core/event.js',
                        'lib/gmu/src/core/widget.js',
                        'lib/gmu/src/widget/popover/popover.js',
                        'lib/gmu/src/widget/popover/placement.js',
                        'lib/gmu/src/widget/popover/arrow.js',
                        'lib/gmu/src/widget/popover/collision.js',
                        'lib/gmu/src/widget/popover/dismissible.js',
                        'lib/gmu/src/widget/toolbar/toolbar.js',
                        'lib/gmu/src/widget/toolbar/$position.js',
                        'lib/gmu/src/extend/throttle.js',
                        'lib/gmu/src/extend/event.scrollStop.js',
                        'lib/gmu/src/extend/highlight.js',
                        'lib/gmu/src/widget/button/button.js'
                    ]
                }
            },
            column: {
                options : {
                    noncmd: true
                },
                files: {
                    'assets/column/1.0.0/column.js': [
                        'static/js/column/1.0.0/column.js'
                    ]
                }
            },
            foundation : {
                options : {
                    noncmd: true
                },
                files: {
                    'assets/foundation/5.5.0/foundation-debug.js': [
                        'lib/foundation/5.5.0/js/vendor/*.js',
                        'lib/foundation/5.5.0/js/foundation.js',
                        'lib/foundation/5.5.0/js/foundation/*.js'
                    ]
                }
            },
            bootstrap : {
                options : {
                    noncmd: true
                },
                files: {
                    'assets/bootstrap/3.3.2/bootstrap-debug.js': [
                        'lib/bootstrap/3.3.2/js/transition.js',
                        'lib/bootstrap/3.3.2/js/alert.js',
                        'lib/bootstrap/3.3.2/js/button.js',
                        'lib/bootstrap/3.3.2/js/carousel.js',
                        'lib/bootstrap/3.3.2/js/collapse.js',
                        'lib/bootstrap/3.3.2/js/dropdown.js',
                        'lib/bootstrap/3.3.2/js/modal.js',
                        'lib/bootstrap/3.3.2/js/tooltip.js',
                        'lib/bootstrap/3.3.2/js/popover.js',
                        'lib/bootstrap/3.3.2/js/scrollspy.js',
                        'lib/bootstrap/3.3.2/js/tab.js',
                        'lib/bootstrap/3.3.2/js/affix.js'
                    ]
                }
            }
        },
        uglify : {
            options: {
                mangle: true
            },
            bootstrap: {
                options: {
                    preserveComments: 'some'
                },
                src: 'assets/bootstrap/3.3.2/bootstrap-debug.js',
                dest: 'assets/bootstrap/3.3.2/bootstrap.js'
            },
            foundation: {
                src: 'assets/foundation/5.5.0/foundation-debug.js',
                dest: 'assets/foundation/5.5.0/foundation.js'
            },
            compress: {
                files : [{
                    expand : true,
                    cwd : 'assets/',
                    src : ['$.js', 'cellula/**/*.js', 'fdp/**/*.js', 'common/**/*.js'],
                    dest : 'assets/'
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: 'jshint/.jshintrc'
            },
            assets: {
                src: ['lib/*.js', 'lib/**/**/*.js', 'static/js/**/**/*.js']
            }
        },
        clean : {
            temp : []
        },
        watch: {
            style: {
                files: ['static/css/**/*.css'],
                tasks: ['cssmin', 'css_import']
            },
            scripts: {
                files: ['lib/**/**/*.js', 'static/js/**/**/*.js'],
                tasks: ['transport', 'concat', 'uglify']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-csscomb');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-css-import');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // foundation js
    grunt.registerTask('foundation-dist-js', ['concat:foundation', 'uglify:foundation']);
    // bootstrap js
    grunt.registerTask('bootstrap-dist-js', ['concat:bootstrap', 'uglify:bootstrap', 'bootstrap-commonjs']);
    // bootstrap common js
    grunt.registerTask('bootstrap-commonjs', 'Generate CommonJS entrypoint module in dist dir.', function () {
        var srcFiles = [
            'assets/bootstrap/3.3.2/js/transition.js',
            'assets/bootstrap/3.3.2/js/alert.js',
            'assets/bootstrap/3.3.2/js/button.js',
            'assets/bootstrap/3.3.2/js/carousel.js',
            'assets/bootstrap/3.3.2/js/collapse.js',
            'assets/bootstrap/3.3.2/js/dropdown.js',
            'assets/bootstrap/3.3.2/js/modal.js',
            'assets/bootstrap/3.3.2/js/tooltip.js',
            'assets/bootstrap/3.3.2/js/popover.js',
            'assets/bootstrap/3.3.2/js/scrollspy.js',
            'assets/bootstrap/3.3.2/js/tab.js',
            'assets/bootstrap/3.3.2/js/affix.js'
        ];
        var destFilepath = 'assets/bootstrap/3.3.2/npm.js';
        bootstrapGenerateCommonJSModule(grunt, srcFiles, destFilepath);
    });
    // other js
    grunt.registerTask('other-dist-js', ['concat:cellula', 'concat:fdp', 'concat:column', 'concat:gmu', 'uglify:compress']);
    // foundation css
    grunt.registerTask('foundation-dist-css', ['csscomb:foundation', 'cssmin:foundation']);
    // bootstrap css
    grunt.registerTask('bootstrap-less-compile', ['less:bootstrap_compileCore', 'less:bootstrap_compileTheme']);
    grunt.registerTask('bootstrap-dist-css', ['bootstrap-less-compile', 'autoprefixer:bootstrap_core', 'autoprefixer:bootstrap_theme', 'csscomb:bootstrap', 'cssmin:bootstrap_minifyCore', 'cssmin:bootstrap_minifyTheme']);
    // other css
    grunt.registerTask('other-dist-css', ['css_import', 'cssmin:minify', 'cssmin:compress']);
    // other
    grunt.registerTask('other', ['copy', 'transport']);
    // Full
    grunt.registerTask('default', ['other', 'bootstrap-dist-js', 'foundation-dist-js', 'other-dist-js',  'bootstrap-dist-css', 'foundation-dist-css', 'other-dist-css']);

};
