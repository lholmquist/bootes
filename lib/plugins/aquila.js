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

var async   = require('async'),
    Channel = require('@projectodd/aquila').Channel;

function Aquila(config) {
  if (!(this instanceof Aquila)) return new Aquila(config);

  var self = this;

  self.config = config || {};
  self.name = 'aquila';
  self.channel = Channel.create(self.config.name);
  self.connected = false;
  self.services = {};

  self.channel.on('message', onMessage);

  function onMessage(body, message) {
    body = JSON.parse(body);
    if (body.name) {
      self.services[body.name] = body.url
    } else if (body.discover && self.services[body.discover]) {
      var payload = JSON.stringify({name: body.discover,
                                    url: self.services[body.discover]});
      self.channel.send(message.source, payload);
    }
  }
}

module.exports = Aquila;

Aquila.prototype.advertise = function(name, url, cb) {
  var self = this;

  self._onceConnected(function(err) {
    if (err) {
      return cb(err);
    }
    var payload = JSON.stringify({name: name, url: url});
    self.services[name] = url;
    self.channel.publish(payload, cb);
  });
};

Aquila.prototype.discover = function(name, cb) {
  var self = this;

  self._onceConnected(function(err) {
    if (err) {
      return cb(err);
    }
    if (self.services[name]) {
      return cb(null, self.services[name]);
    }

    var payload = JSON.stringify({discover: name});
    self.channel.publish(payload);

    var start = new Date();
    var timeout = self.config.timeout || 500; // ms
    async.forever(checkAgain);

    function checkAgain(next) {
      if (self.services[name]) {
        return cb(null, self.services[name]);
      }
      var elapsed = new Date() - start;
      if (elapsed < timeout) {
        setTimeout(next, 10);
      } else {
        return cb();
      }
    }
  });
};

Aquila.prototype.stop = function(cb) {
  // FIXME - actually stop things, but Aquila needs a way to do so first
  setImmediate(cb);
};

Aquila.prototype._onceConnected = function(cb) {
  var self = this;

  if (self.connected) {
    return setImmediate(cb);
  }

  self.channel.connect(connectHandler, errorHandler);

  function connectHandler(channel) {
    self.connected = true;
    cb();
  }

  function errorHandler(err) {
    cb(err);
  }
};
