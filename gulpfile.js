var gulp       	 = require('gulp'),
		less			   = require('gulp-less'),
		browserSync  = require('browser-sync'),
		concat       = require('gulp-concat'),
		uglify       = require('gulp-uglifyjs'),
		cssnano      = require('gulp-cssnano'),
		rename       = require('gulp-rename'),
		del          = require('del'),
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		cache        = require('gulp-cache'),
		autoprefixer = require('gulp-autoprefixer'),
		svgmin       = require('gulp-svgmin'),
		cheerio      = require('gulp-cheerio'),
		replace      = require('gulp-replace'),
		svgSprite    = require('gulp-svg-sprite'),
		babel        = require('gulp-babel');

gulp.task('less', function(){
	return gulp.src('app/less/style.less')
		.pipe(less())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('scripts', function(){
	return gulp.src('app/js/scripts.js')
		.pipe(concat('scripts.min.js'))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(gulp.dest('app/js/'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

gulp.task('libsjs', ['scripts'], function() {
	return gulp.src([
		'app/libs/jquery/jquery-1.11.1.min.js',
		'app/libs/jquery-ui/jquery-ui.min.js',
		'app/libs/jquery-ui/jquery.ui.touch-punch.min.js',
	])
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('libscss', ['less'], function(){
	return gulp.src([
		'app/libs/jquery-ui/jquery-ui.min.css',
	])
		.pipe(concat('libs.min.css'))
		.pipe(cssnano())
		.pipe(gulp.dest('app/css/'))
});

gulp.task('svg', () => {
	return gulp.src('app/img/**/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOption: {xmlMode: true}
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "../sprite.svg"
				}
			}
		}))
		.pipe(gulp.dest('app/img/'))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['browser-sync', 'libscss', 'libsjs', 'svg'], function() {
	gulp.watch('app/less/**/*.less', ['less']);
	gulp.watch('app/js/**/*.js', ['scripts']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/img/**/*.svg', ['svg']);
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({
		// .pipe(imagemin({ // Зжимаємо зображення без кешування
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))/**/)
		.pipe(gulp.dest('dist/img'));
});

gulp.task('build', ['clean', 'img', 'libscss', 'libsjs'], function() {

	var buildCss = gulp.src([
		'app/css/*.css',
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src([
		'app/js/libs.min.js',
		'app/js/scripts.min.js',
		])
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
});

gulp.task('default', ['watch']);
