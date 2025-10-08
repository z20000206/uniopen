// ==== 必要套件 ====
const path = require('path');
const del = require('del');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const dependents = require('gulp-dependents');
const filter = require('gulp-filter');
const flatmap = require('gulp-flatmap');
const gulpIf = require('gulp-if');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const babelCore = require('@babel/core');
const eslint = require('gulp-eslint');

const nunjucksRender = require('gulp-nunjucks-render');

const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const resolveUrl = require('gulp-resolve-url');

const imagemin = require('gulp-imagemin');

// ==== Windows/網路磁碟/中文路徑：強制輪詢更穩 ====
process.env.CHOKIDAR_USEPOLLING = '1';

const suffix = { min: '.min' };
const isBuildTask = process.argv.slice(2)[0] === 'build';

const watchOptions = {
  ignoreInitial: true,                 // 初始由 buildOnce 做
  usePolling: true,
  interval: 300,
  awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
};

// ==== HTML 依賴解析（NJK include/extends）====
let parserRegex =
  /(?:{#.*?#})|{%\s+(?:extends|include|import|from)\s+(?:"|')(.+?)(?:"|')(?:\s+(?:import|as)\s+(?:\w|\s|,)*)?\s+%}/gm;
let dependentsConfig = {
  '.tmpl': { parserSteps: [parserRegex] },
  '.part': { parserSteps: [parserRegex] },
  '.njk': {
    parserSteps: [
      parserRegex,
      function (url) {
        return [path.join(path.resolve('./src/'), url)];
      },
    ],
  },
};

// ==== 清空 dist ====
function clean() {
  return del(['./dist/**']);
}

// ==== build：JS ====
function buildScript() {
  return gulp
    .src(['./src/**/*.js', '!./src/content/vendor/**/*'], { base: './src' })
    .pipe(eslint())                 // 開發期如怕被中斷，可先註解掉這兩行
    .pipe(eslint.format())
    // .pipe(eslint.failAfterError()) // 想要嚴格就打開
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename({ suffix: suffix.min }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./', { sourceRoot: '/' }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream({ match: '**/*.js' }));
}

// ==== build：純 CSS ====
function buildCss() {
  return gulp
    .src(['./src/**/*.css', '!./src/content/vendor/**/*'], { base: './src' })
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./', { sourceRoot: '/' }))
    .pipe(gulp.dest('./dist/'))
    .pipe(filter(['**', '!**/*.map']))
    .pipe(cleanCss())
    .pipe(rename({ suffix: suffix.min }))
    .pipe(sourcemaps.write('./', { sourceRoot: '/' }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
}

// ==== build：SCSS ====
function buildScss() {
  return gulp
    .src(['./src/**/*.scss', '!./src/content/vendor/**/*'], { base: './src' })
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(resolveUrl({ debug: true }))
    .pipe(sourcemaps.write('./', { sourceRoot: '/' }))
    .pipe(gulp.dest('./dist/'))
    .pipe(filter(['**', '!**/*.map']))
    .pipe(cleanCss())
    .pipe(rename({ suffix: suffix.min }))
    .pipe(sourcemaps.write('./', { sourceRoot: '/' }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream({ match: '**/*.css' }));
}

// ==== build：圖片 ====
function buildImage() {
  return gulp
    .src(['./src/**/*.{png,jpg,jpeg,gif,svg}', '!./src/content/vendor/**/*'], { base: './src' })
    .pipe(
      gulpIf(
        isBuildTask,
        imagemin(
          [
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 100, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({ plugins: [{ removeViewBox: false }, { cleanupIDs: false }] }),
          ],
          { verbose: true },
        ),
      ),
    )
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream({ match: '**/*.{png,jpg,jpeg,gif,svg}' }));
}

// ==== build：第三方套件拷貝 ====
function buildPlugin() {
  return gulp
    .src('./src/content/vendor/**/*', { base: './src' })
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
}

// ==== build：其他靜態資源 ====
function buildOther() {
  return gulp
    .src(
      [
        './src/**/*',
        '!./src/**/*.{njk,part,tmpl,js,css,scss,png,jpg,jpeg,gif,svg}',
        '!./src/**/.git*',
        '!./src/content/vendor/**/*',
      ],
      { base: './src' },
    )
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
}

// ==== build：Nunjucks → HTML ====
function buildHtml() {
  return gulp
    .src(['./src/**/*.njk', '!./src/content/vendor/**/*'], { base: './src' })
    .pipe(dependents(dependentsConfig, { logDependents: true }))
    .pipe(filter(['**', '!**/*.{tmpl,part}']))
    .pipe(
      flatmap(function (stream, file) {
        return stream
          .pipe(plumber())
          .pipe(
            nunjucksRender({
              path: ['./src/'],
              manageEnv: function (env) {
                env.addFilter('relativePath', function (url, filePath = file.relative) {
                  if (url === '#') return url;
                  let current = path.posix.join.apply(path, filePath.split(/\/|\\/));
                  if (!path.posix.isAbsolute(current)) current = path.posix.sep + current;
                  let relativePath = path.posix.relative(path.posix.dirname(current), url);
                  if (relativePath.substring(1, 1) !== '.') relativePath = './' + relativePath;
                  return relativePath;
                });
                env.addFilter('padLeft', function (val, str, len) {
                  val = '' + val;
                  return val.length >= len ? val : new Array(len - val.length + 1).join(str) + val;
                });
                env.addFilter('3x', function (fileName) {
                  let parser = path.parse(fileName);
                  return parser.name + '__3x' + parser.ext;
                });
              },
            }),
          )
          .pipe(
            replace(/<script>([\S\s]*?)<\/script>/gi, function (match, p1) {
              const result = babelCore.transform(p1, { configFile: './.babelrc' });
              return `\n<script>\n${result.code}\n</script>\n`;
            }),
          );
      }),
    )
    .pipe(gulp.dest('./dist/'))
    .on('end', () => browserSync.reload());
}

// ==== 一次性 build（啟動時先跑一次，填滿 dist）====
const buildOnce = gulp.parallel(
  buildScript,
  buildCss,
  buildScss,
  buildImage,
  buildPlugin,
  buildOther,
  buildHtml,
);

// ==== Watch：任何存檔都重跑對應任務 ====
function watchAll() {
  gulp.watch(['./src/**/*.js', '!./src/content/vendor/**/*'], watchOptions, buildScript);
  gulp.watch(['./src/**/*.css', '!./src/content/vendor/**/*'], watchOptions, buildCss);
  gulp.watch(['./src/**/*.scss', '!./src/content/vendor/**/*'], watchOptions, buildScss);
  gulp.watch(['./src/**/*.{png,jpg,jpeg,gif,svg}', '!./src/content/vendor/**/*'], watchOptions, buildImage);
  gulp.watch(['./src/content/vendor/**/*'], watchOptions, buildPlugin);
  gulp.watch(
    [
      './src/**/*',
      '!./src/**/*.{njk,part,tmpl,js,css,scss,png,jpg,jpeg,gif,svg}',
      '!./src/**/.git*',
      '!./src/content/vendor/**/*',
    ],
    watchOptions,
    buildOther,
  );
  gulp.watch(['./src/**/*.{njk,tmpl,part}', '!./src/content/vendor/**/*'], watchOptions, buildHtml);
}

// ==== 開發伺服器 ====
function serve(done) {
  browserSync.init({ server: { baseDir: './dist/' } });
  done();
}

// ==== 指令 ====
exports.build = gulp.series(clean, buildOnce);       // 正式打包
exports.dev = gulp.series(clean, buildOnce, serve, watchAll); // 開發
exports.default = exports.dev;
