// Variables init
const gulp = require("gulp");
const bSync = require("browser-sync");
const cssmin = require("gulp-cssmin");
const autoprefixer = require("autoprefixer");
const rename = require("gulp-rename");
const less = require("gulp-less");
const concat = require("gulp-concat");
const jsValidate = require("gulp-jsvalidate");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const del = require("del");
const svgSprite = require("gulp-svg-sprite");
const cheerio = require("gulp-cheerio");
const svgmin = require("gulp-svgmin");
const replace = require("gulp-replace");
const imagemin = require('gulp-tinypng');
const postcss = require("gulp-postcss");
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

// Proxies
const proxy = {
    web: "clean.l/"
};

// Define let of path
const path = {
    // App sources
    app: "*.html",
    less: "assets/less/**/*.less",
    lessMain: "assets/less/main.less",
    js: "assets/js/**/*.js",
    jsMain: "assets/js/app.js",
    build: {
        css: "build/css/",
        js: "build/js/",
        svgOut: "build/svg/build/"
    },
    svg: "build/svg/sources/*.svg",
};

gulp.task("copy", function() {
    return gulp
        .src(path.nodeSource, { base: "./node_modules/" })
        .pipe(gulp.dest(path.nodeDest));
});

// Clean assets
function clean() {
    return del(["assets/build/css/"]);
}

gulp.task("svg-build", function() {
    return (
        gulp
            .src(path.svg)
            // minify svg
            .pipe(
                svgmin({
                    js2svg: {
                        pretty: true
                    }
                })
            )
            // remove all fill, style and stroke declarations in out shapes
            .pipe(
                cheerio({
                    run: function($) {
                        $("[fill]").removeAttr("fill");
                        /* $("[stroke]").removeAttr("stroke"); */
                        $("[style]").removeAttr("style");
                        $("[opacity]").removeAttr("opacity");
                    },
                    parserOptions: { xmlMode: true }
                })
            )
            // cheerio plugin create unnecessary string '&gt;', so replace it.
            .pipe(replace("&gt;", ">"))
            // build svg sprite
            .pipe(
                svgSprite({
                    mode: {
                        symbol: {
                            sprite: "../sprite.svg"
                        }
                    }
                })
            )
            .pipe(gulp.dest(path.build.svgOut))
    );
});

// Task less Common
gulp.task("less", function() {
    return gulp
        .src(path.lessMain)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(less())
        .pipe(postcss([autoprefixer({ grid: true })]))
        .pipe(cssmin())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(path.build.css))
        .pipe(bSync.reload({ stream: true }));
});

// Task scripts
gulp.task("scripts", function() {
    return gulp
        .src(path.js)
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
            )
        .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
        .pipe(concat("scripts.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(bSync.reload({ stream: true }));
});

// Task reload page
gulp.task("app", function() {
    return gulp.src(path.app).pipe(bSync.reload({ stream: true }));
});

// Task reload page
gulp.task("svg", function() {
    return gulp.src(path.svg).pipe(bSync.reload({ stream: true }));
});

// Initalize WebServer BrowserSync
gulp.task("ws", function(cb) {
    bSync(
        {
            /* server: {
                baseDir: "./"
			} */
            proxy: proxy.web
        },
        cb
    );
});

// Task watch styles
gulp.task("watch:styles", function() {
    gulp.watch(path.less, gulp.series(clean, gulp.parallel("less")));
});

// Task watch scripts
gulp.task("watch:scripts", function() {
    gulp.watch(path.js, gulp.series(clean, gulp.parallel("scripts")));
});

// Task watch app
gulp.task("watch:app", function() {
    gulp.watch(path.app, gulp.series(gulp.parallel("app")));
});

// Task watch svg
gulp.task("watch:svg", function() {
    gulp.watch(path.svg, gulp.series(gulp.parallel("svg-build")));
});

// Task watch for all scripts above
gulp.task(
    "watch",
    gulp.series(
        gulp.parallel(
            "ws",
            "watch:styles",
            "watch:scripts",
            "watch:app",
            "watch:svg"
        )
    )
);

gulp.task(
    "build",
    gulp.series(gulp.series(clean, "less", "scripts", "svg-build"))
);

gulp.task("clean", gulp.series(clean));

// Set default task
gulp.task("default", gulp.series("ws", "watch"));
