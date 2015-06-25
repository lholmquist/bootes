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

var async = require('async');

function Bootes() {
  if (!(this instanceof Bootes)) return new Bootes();

  this.plugins = [];
}

module.exports = Bootes;

Bootes.prototype.use = function(name, config) {
  var plugin = require('./plugins/' + name)(config);
  this.plugins.push(plugin);
  return this;
};

Bootes.prototype.advertise = function(name, url, cb) {
  async.eachSeries(this.plugins, doAdvertise, cb);

  function doAdvertise(plugin, callback) {
    plugin.advertise(name, url, callback);
  }
  return this;
};

Bootes.prototype.discover = function(name, cb) {
  var self = this;

  doDiscover(0);

  function doDiscover(i) {
    self.plugins[i].discover(name, function(err, url) {
      if(err) {
        console.log('err');
        return cb(err);
      }
      if(url || i === self.plugins.length - 1) {
        return cb(null, url);
      }
      doDiscover(i + 1)
    });
  }
  return this;
};

Bootes.prototype.stop = function(cb) {
  async.eachSeries(this.plugins, doStop, cb);

  function doStop(plugin, callback) {
    plugin.stop(callback);
  }
  return this;
};
