var fs = require('fs'),
    rjs = require('requirejs'),
    UglifyJS = require('uglify-js');

rjs.optimize({
    optimize: 'none',

    baseUrl: 'src',
    paths: {
        'grafico-ql': 'GraficoQL'
    },
    include: [
        'grafico-ql'
    ],
    out: function (text, sourceMapText) {
        fs.writeFileSync('dist/grafico-ql.js', text);
        fs.writeFileSync(
            'dist/grafico-ql.min.js',
            UglifyJS.minify(text, {compress: {sequences: false}}).code
        );
    },
    wrap: {
        end: ["if (typeof define === 'function' && define.amd) {\n",
            "    define(['grafico-ql'], function (GraficoQL) { return GraficoQL; });\n",
            "}\n"
        ].join('')
    },

    preserveLicenseComments:	false,
    skipModuleInsertion:		true,
    findNestedDependencies:		true
}, function (buildResponse) {
    console.log(buildResponse);
    resolve(buildResponse);
});

(function () {
    var vars = JSON.parse(fs.readFileSync('package.json', 'utf-8')),
        tpl = fs.readFileSync('README.md.mustache', 'utf-8'),
        Mustache = require('mustache');

    fs.writeFileSync('README.md', Mustache.render(tpl, vars));
})();
