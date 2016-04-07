'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var modulePath = '../src';

var expectedReport = {
    functions: [],
    dependencies: [],
    maintainability: 171,
    loc: 1,
    cyclomatic: 1,
    effort: 0,
    params: 0,
    path: ''
};

suite('index:', function () {
    test('require does not throw', function () {
        assert.doesNotThrow(function () {
            require(modulePath);
        });
    });

    test('require returns object', function () {
        assert.isObject(require(modulePath));
    });

    suite('require:', function () {
        var index;

        setup(function () {
            index = require(modulePath);
        });

        teardown(function () {
            index = undefined;
        });

        test('analyse function is exported', function () {
            assert.isFunction(index.analyse);
        });

        test('analyse does not throw', function () {
            assert.doesNotThrow(function () {
                index.analyse();
            });
        });

        suite('array source:', function () {
            var result;

            setup(function () {
                var ast = [{
                  path: '/foo.js',
                  code: 'console.log("foo");'
                },{
                  path: '../bar.js',
                  code: '"bar";'
                }];
                result = index.analyse(ast, {});
            });

            teardown(function () {
                result = undefined;
            });

            test('correct result was returned', function () {
                assert.strictEqual(result.reports.length, 2);

                var expectedFirstReport = _.extend({}, expectedReport, {
                    aggregate: {
                        cyclomatic: 1,
                        cyclomaticDensity: 100,
                        halstead: {
                            bugs: 0,
                            difficulty: 0,
                            effort: 0,
                            length: 1,
                            operands: {
                                distinct: 1,
                                total: 1,
                                identifiers: ['"bar"']
                            },
                            operators: {
                                distinct: 0,
                                total: 0,
                                identifiers: []
                            },
                            time: 0,
                            vocabulary: 1,
                            volume: 0
                        },
                        line: 1,
                        name: undefined,
                        params: 0,
                        sloc: {
                            logical: 1,
                            physical: 1
                        }
                    },
                    path: '../bar.js'
                });
                assert.deepEqual(result.reports[0], expectedFirstReport);

                var expectedSecondReport = _.extend({}, expectedReport, {
                    aggregate: {
                        cyclomatic: 1,
                        cyclomaticDensity: 100,
                        line: 1,
                        name: undefined,
                        params: 0,
                        sloc: {
                            logical: 1,
                            physical: 1
                        },
                        halstead: {
                            bugs: 0.0038698801581456034,
                            difficulty: 1,
                            effort: 11.60964047443681,
                            length: 5,
                            operands: {
                                distinct: 3,
                                total: 3,
                                identifiers: [
                                    '"foo"',
                                    'console',
                                    'log'
                                ]
                            },
                            operators: {
                                distinct: 2,
                                total: 2,
                                identifiers: [
                                    '()',
                                    '.'
                                ]
                            },
                            time: 0.6449800263576005,
                            vocabulary: 5,
                            volume: 11.60964047443681
                        }
                    },
                    effort: 11.60964047443681,
                    maintainability: 162.61472146706737,
                    path: "/foo.js"
                });
                assert.deepEqual(result.reports[1], expectedSecondReport);
            });
        });

        suite('array source with bad code:', function() {
            var code;

            setup(function () {
                code = [ { path: '/foo.js', code: 'foo foo' }, { path: '../bar.js', code: '"bar";' } ];
                index = require(modulePath);
            });

            teardown(function () {
                code = undefined;
            });

            test('throws an error with default options', function() {
                assert.throws(function() {
                    index.analyse(code, {});
                }, '/foo.js: Line 1: Unexpected identifier');
            });

            test('swallows error with options.ignoreErrors', function() {
                assert.doesNotThrow(function() {
                    index.analyse(code, { ignoreErrors: true });
                });
            });
        });

        suite('string source:', function () {
            test('gh-17 regression test', function () {
                assert.doesNotThrow(function () {
                    index.analyse('(function() { var a; })();', {
                        range: true,
                        comment: true
                    });
                });
            });

            test('correct result was returned', function () {
                var report = index.analyse('var foo, bar, baz', {});
                var expected = _.extend({}, expectedReport, {
                    aggregate: {
                        cyclomatic: 1,
                        cyclomaticDensity: 33.33333333333333,
                        halstead: {
                            bugs: 0.0026666666666666666,
                            difficulty: 0.5,
                            effort: 4,
                            length: 4,
                            operands: {
                                distinct: 3,
                                total: 3,
                                identifiers: [
                                    'foo',
                                    'bar',
                                    'baz'
                                ]
                            },
                            operators: {
                                distinct: 1,
                                total: 1,
                                identifiers: [
                                    'var'
                                ]
                            },
                            time: 0.2222222222222222,
                            vocabulary: 4,
                            volume: 8
                        },
                        line: 1,
                        name: undefined,
                        params: 0,
                        sloc: {
                            logical: 3,
                            physical: 1
                        }
                   },
                    cyclomatic: 1,
                    dependencies: [],
                    effort: 4,
                    functions: [],
                    maintainability: 148.4613542085466,
                    loc: 3,
                    params: 0
                });
                delete expected.path;
                assert.deepEqual(report, expected);
            });
        });
    });
});
