/*!
 * gulp
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-cssnano gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    connect = require('gulp-connect'),
    inject = require('gulp-inject');


var paths = {
  sass: ['./scss/**/*.scss'],
  css: ['./app/*.css',
        '!./app/bower_components/**/*.css',
        '!./app/*app.css'],
  javascript: ['./app/**/*.js',
               '!./app/app.js',
               '!./app/bower_components/**/*.js',
               '!./app/components/**/*.js',
               '!./app/**/*test.js']
};

// Styles
// gulp.task('styles', function() {
//   return sass('src/styles/main.scss', { style: 'expanded' })
//     .pipe(autoprefixer('last 2 version'))
//     .pipe(gulp.dest('dist/styles'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(cssnano())
//     .pipe(gulp.dest('dist/styles'))
//     .pipe(notify({ message: 'Styles task complete' }));
// });

// Scripts
// gulp.task('scripts', function() {
//   return gulp.src('src/scripts/**/*.js')
//     .pipe(jshint('.jshintrc'))
//     .pipe(jshint.reporter('default'))
//     .pipe(concat('main.js'))
//     .pipe(gulp.dest('dist/scripts'))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(uglify())
//     .pipe(gulp.dest('dist/scripts'))
//     .pipe(notify({ message: 'Scripts task complete' }));
// });

// Images
// gulp.task('images', function() {
//   return gulp.src('src/images/**/*')
//     .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
//     .pipe(gulp.dest('dist/images'))
//     .pipe(notify({ message: 'Images task complete' }));
// });


// Clean
gulp.task('clean', function() {
  return del(['dist/styles', 'dist/scripts', 'dist/images']);
});

// Default task
gulp.task('default', ['clean'], function() {
  //gulp.start('styles', 'scripts', 'images');
  gulp.start('index','connect', 'watch');
});

gulp.task('connect', function(){

    connect.server({
        root: 'app',
        port: 8000,
        livereload: true        
    });

});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./app/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./app/'))
    .on('end', done);
});

gulp.task('index', function(){
     return gulp.src('./app/index.html')
         .pipe(inject(
             gulp.src(paths.javascript,
                 {read: false}), {relative: true}))
          .pipe(inject(
             gulp.src(paths.css,
                 {read: false}), {relative: true}))
         .pipe(gulp.dest('./app'));
 });

// Watch
gulp.task('watch', function() {

  // Watch .scss files
  gulp.watch(paths.sass, ['sass']);

  gulp.watch(paths.javascript, ['index']);

  // Watch .js files
  //gulp.watch('src/scripts/**/*.js', ['scripts']);

  // Watch image files
  //gulp.watch('src/images/**/*', ['images']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in app/, reload on change
  gulp.watch(['app/**']).on('change', livereload.changed);

});