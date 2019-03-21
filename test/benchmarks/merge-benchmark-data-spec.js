const chai = require('chai');
const path = require('path');
const assert = chai.assert;

const mergeBenchmarkData = require('../../scripts/benchmarks/helpers/merge-benchmark-data-helpers');

describe('mergeBenchmarkData', function() {
  describe('getOrderedFileNames', function() {
    it('orders files in a dir alphabetically', () => {
      const orderingJsonDir = '../../test/benchmarks/files/ordering-json/';
      const expectedOrder = ['000-benchmark.json', '001-benchmark.json', '999-benchmark.json'];
      assert.deepEqual(mergeBenchmarkData.getOrderedFileNames(__dirname, orderingJsonDir), expectedOrder);
    });
  });

  describe('getBenchmarkKey', function() {
    it('parses correctly the key', function() {
      const benchmark = {
        measureId: '458',
        benchmarkYear: 2015,
        performanceYear: 2017,
        submissionMethod: 'administrativeClaims',
        deciles: [ 100, 15.75, 15.41, 15.05, 14.89, 14.65, 14.45, 14.16, 13.82 ]
      };
      assert.equal(mergeBenchmarkData.getBenchmarkKey(benchmark), '458|2015|2017|administrativeClaims|');
    });

    it('throws an error when a key is missing', function() {
      const benchmark = {
        benchmarkYear: 2015,
        performanceYear: 2017,
        submissionMethod: 'administrativeClaims',
        deciles: [ 100, 15.75, 15.41, 15.05, 14.89, 14.65, 14.45, 14.16, 13.82 ]
      };
      assert.throws(() => {
        mergeBenchmarkData.getBenchmarkKey(benchmark);
      }, /Key is missing: measureId/);
    });
  });

  describe('getBenchmarkKey', function() {
    const JSON_FIXTURES_DIR = path.join(__dirname, 'files/');
    const baseLayer = 'base_layer.json';

    it('throws error when there are duplicate benchmarks between layers', function() {
      const secondLayer = 'overwrite_001_claims.json';

      const layers = [baseLayer, secondLayer];
      assert.throws(() => {
        mergeBenchmarkData.mergeBenchmarkLayers(layers, JSON_FIXTURES_DIR);
      }, /Merge Conflicts: /);
    });

    it('joins a third independent layer w/ benchmarks in the correct ordering', function() {
      const thirdLayer = 'independent_layer.json';

      const layers = [baseLayer, thirdLayer];

      const resultingBenchmarks = [{
        measureId: '001',
        benchmarkYear: 2015,
        performanceYear: 2017,
        submissionMethod: 'claims',
        deciles: [
          100,
          35,
          25.71,
          20.31,
          16.22,
          13.04,
          10,
          7.41,
          4
        ]
      },
      {
        measureId: '001',
        benchmarkYear: 2015,
        performanceYear: 2017,
        submissionMethod: 'electronicHealthRecord',
        deciles: [
          100,
          54.67,
          35.9,
          25.62,
          19.33,
          14.14,
          9.09,
          3.33,
          0
        ]
      },
      {
        measureId: '999',
        benchmarkYear: 2015,
        performanceYear: 2017,
        submissionMethod: 'claims',
        deciles: [
          100,
          50,
          25,
          20,
          16.22,
          11.02,
          10,
          7.41,
          4
        ]
      },
      {
        measureId: 'dmComposite',
        benchmarkYear: 2016,
        performanceYear: 2018,
        submissionMethod: 'cmsWebInterface',
        isToppedOut: false,
        deciles: [
          0,
          29.9,
          29.9,
          34.33,
          38.81,
          43.32,
          48.21,
          53.64,
          60.37
        ]
      }];
      assert.deepEqual(mergeBenchmarkData.mergeBenchmarkLayers(layers, JSON_FIXTURES_DIR), resultingBenchmarks);
    });

    it('throws an error when a measure is missing a field ', function() {
      const secondLayer = 'missing_id_layer.json';

      const layers = [baseLayer, secondLayer];
      assert.throws(() => {
        mergeBenchmarkData.mergeBenchmarkLayers(layers, JSON_FIXTURES_DIR);
      }, /Key is missing: measureId/);
    });
  });
});
