const gulp           = require('gulp');
const less           = require('gulp-less');
const LessCleanCSS   = require('less-plugin-clean-css');
const LessAutoPrefix = require('less-plugin-autoprefix');
const watch          = require('gulp-watch');

const cleancss   = new LessCleanCSS({ advanced: true });
const autoprefix = new LessAutoPrefix({ browsers: ['last 4 versions'] });

gulp.task('less', () =>
    gulp.src('src/index.less')
        //.pipe(sourcemaps.init())
        .pipe(less({
            plugins: [autoprefix, cleancss]
        }))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('src/'))
);

gulp.task('watch-less', () => {
    watch('src/**/*.less', () => {
        gulp.start('less');
    });
});

gulp.task('default', ['less']);
gulp.task('watch', ['default', 'watch-less']);
