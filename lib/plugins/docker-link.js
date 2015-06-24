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

var dockerLinks = require('docker-links'),
    url = require('url');

function DockerLink(config) {
  if (!(this instanceof DockerLink)) return new DockerLink(config);

  this.name = 'docker-link';
  this.links = dockerLinks.parseLinks(process.env);
  this.config = config;
}

module.exports = DockerLink;

DockerLink.prototype.advertise = function(name, url, cb) {
  // no-op since we discover from docker env variables
  setImmediate(cb);
};

DockerLink.prototype.discover = function(name, cb) {
  var key = name;
  var link = this.links[key];
  var serviceUrl;
  if (link) {
    serviceUrl = substituteBootesParts(name, link.url);
  }
  setImmediate(cb, null, serviceUrl);
};

DockerLink.prototype.stop = function(cb) {
  setImmediate(cb);
};

function substituteBootesParts(name, linkUrl) {
  var parsedUrl = url.parse(linkUrl);
  var envPrefix = name.toUpperCase() + '_ENV_';
  var schemeKey = envPrefix + 'BOOTES_SCHEME';
  var pathKey = envPrefix + 'BOOTES_PATH';
  if (process.env[schemeKey]) {
    parsedUrl.protocol = process.env[schemeKey];
  }
  if (process.env[pathKey]) {
    parsedUrl.pathname = process.env[pathKey];
  }
  return url.format(parsedUrl);
}
