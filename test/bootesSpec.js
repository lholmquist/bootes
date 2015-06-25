/*!
 * Copyright 2015 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var assert  = require('assert'),
    fs      = require('fs'),
    Bootes  = require('../');

describe('bootes', function() {

  it('should have chainable API calls', function(done) {
    var bootes = require('../')()
        .use('in-memory')
        .use('aquila')
        .advertise('foo', 'bar')
        .discover('foo', function() {
          bootes.stop(done);
        })
    assert.equal(2, bootes.plugins.length);
  });

  it('should pass config to plugins', function() {
    var bootes = new Bootes();
    bootes.use('in-memory', {foo: 'bar'});
    assert.equal('bar', bootes.plugins[0].config.foo);
  });

  var localhostPlugins = ['in-memory', 'aquila'];

  fs.readdirSync(__dirname + '/../lib/plugins/').forEach(function(file) {
    var plugin = file.substring(0, file.length - '.js'.length);

    describe(plugin + ' plugin', function() {
      it('should load', function() {
        var bootes = new Bootes();
        bootes.use(plugin);
        assert.equal(1, bootes.plugins.length)
        assert.equal(plugin, bootes.plugins[0].name);
      });

      it('should implement the plugin API', function() {
        var bootes = new Bootes();
        bootes.use(plugin);
        var loadedPlugin = bootes.plugins[0];
        assert(loadedPlugin.advertise);
        assert(loadedPlugin.discover);
        assert(loadedPlugin.stop);
      });

      if (localhostPlugins.indexOf(plugin) >= 0) {
        describe('advertise and discover', function() {
          var bootes;

          beforeEach(function() {
            bootes = new Bootes();
            bootes.use(plugin, {timeout: 25});
          });

          afterEach(function(done) {
            bootes.stop(done);
          });

          it('should discover own advertisements', function(done) {
            bootes.advertise('my-service', 'foo');
            bootes.discover('my-service', function(err, url) {
              assert.ifError(err);
              assert.equal('foo', url);
              done();
            });
          });

          it('should return null if service not found', function(done) {
            bootes.discover('my-service', function(err, url) {
              assert.ifError(err);
              assert.equal(null, url);
              done();
            });
          });
        });
      }
    });
  });
});
