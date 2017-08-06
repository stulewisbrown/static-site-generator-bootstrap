// Defining base pathes
var basePaths = {
    bower: './bower_components/',
    node: './node_modules/',
    dev: './'
};

var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var cp = require('child_process');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require('gulp-notify');
var cssmin = require('gulp-cssmin');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');


var jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function(done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn(jekyll, ['build'], {
            studio: 'inherit'
        })
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */

gulp.task('serveIt', ['sass', 'scripts', 'jekyll-build'], function() {

    browserSync.init({
        server: {
            baseDir: '_site'
        },
        open: false
    });

    gulp.watch('_sass/**/*.scss', ['sass']);
    gulp.watch('_js/*.js', ['scripts']).on('change', browserSync.reload);
    gulp.watch(['*.html', '_includes/**/*.html', '_data/*.yml', '_layouts/*.html', '*.md', '_posts/**/*'], ['jekyll-rebuild']);
});

/**
 * Compile files from _sass into both _site/css (for live injecting) and site (for future jekyll builds)
 */
// gulp.task('sass', function() {
//     return gulp.src('_sass/main.scss')
//         // .pipe(sourcemaps.init())
//         .pipe(plumber({
//             errorHandler: function (err) {
//                 notify({
//                     message: '!!!styles task failed!!!'
//                 });
//                 console.log(err);
//                 this.emit('end');

//             }    
//         }))
//         .pipe(sass())
//         .pipe(autoprefixer({
//             browsers: ['> 5%', 'last 2 versions', 'Firefox ESR', 'Safari >= 6', 'Opera 12.1'],
//             cascade: false
//         }))
//         .pipe(gulp.dest('css'))
//         .pipe(gulp.dest('_site/css'))
//         .pipe(rename({
//             suffix: '.min'
//         }))
//         .pipe(cssmin())
//         // .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('css'))
//         .pipe(gulp.dest('_site/css'))
//         .pipe(browserSync.reload({
//             stream: true
//         }))
//         .pipe(notify({
//             message: 'Styles task complete'
//         }));
// });

gulp.task('sass', function () {
    return gulp.src('./_sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(plumber({
            errorHandler: function (err) {
                notify({
                    message: '!!!styles task failed!!!'
                });
                console.log(err);
                this.emit('end');

            }    
        }))
        .pipe(sass())
        .pipe(gulp.dest('./css'))
        .pipe(gulp.dest('./_site/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCSS({compatibility: '*'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./css'))
        .pipe(gulp.dest('./_site/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notify({
            message: 'Styles task complete'
        }));
});

// Concatenate & Minify JS
// gulp.task('scripts', function() {
//     return gulp.src('_js/*.js')
//         .pipe(plumber())
//         //.pipe(jshint())
//         //.pipe(jshint.reporter('default'))
//         .pipe(concat('scripts.js'))
//         .pipe(gulp.dest('js'))
//         .pipe(gulp.dest('_site/js'))
//         .pipe(rename({
//             suffix: '.min'
//         }))
//         .pipe(uglify())
//         .pipe(gulp.dest('js'))
//         .pipe(gulp.dest('_site/js'))
//         .pipe(notify({
//             message: 'Scripts task complete'
//         }));
// });

// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task('scripts', function() {
    var scripts = [
        basePaths.dev + '_js/tether.js', // Must be loaded before BS4

        // Start - All BS4 stuff
        basePaths.dev + '_js/bootstrap4/bootstrap.js',

        // End - All BS4 stuff

        basePaths.dev + '_js/skip-link-focus-fix.js',

        basePaths.dev + '_js/js.js'
    ];
  gulp.src(scripts)
    .pipe(concat('scripts.min.js'))
    .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
    .pipe(gulp.dest('js'))
    .pipe(gulp.dest('_site/js'))
    .pipe(notify({
             message: 'Scripts task complete'
         }));

  gulp.src(scripts)
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./js/'));
});


// Copy all Bootstrap JS files
gulp.task('copy-assets', function() {

////////////////// All Bootstrap 4 Assets /////////////////////////
// Copy all Bootstrap JS files
    gulp.src(basePaths.node + 'bootstrap/dist/js/**/*.js')
       .pipe(gulp.dest(basePaths.dev + '/_js/bootstrap4'));

// Copy all Bootstrap SCSS files
    gulp.src(basePaths.node + 'bootstrap/scss/**/*.scss')
       .pipe(gulp.dest(basePaths.dev + '/_sass/bootstrap4'));
////////////////// End Bootstrap 4 Assets /////////////////////////

// Copy jQuery
    gulp.src(basePaths.node + 'jquery/dist/*.js')
        .pipe(gulp.dest(basePaths.dev + '/_js'));

// Copy Tether JS files
    gulp.src(basePaths.node + 'tether/dist/js/*.js')
        .pipe(gulp.dest(basePaths.dev + '/_js'));

// Copy Tether CSS files
    gulp.src(basePaths.node + 'tether/dist/css/*.css')
        .pipe(gulp.dest(basePaths.dev + '_site/css'));
});

gulp.task('default', ['serveIt']);