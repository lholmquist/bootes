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

function InProcess(config) {
  if (!(this instanceof InProcess)) return new InProcess(config);

  this.name = 'in-process';
  this.config = config;
  this.services = {};
}

module.exports = InProcess;

InProcess.prototype.advertise = function(name, url, cb) {
  this.services[name] = url;
  setImmediate(cb);
};

InProcess.prototype.discover = function(name, cb) {
  setImmediate(cb, null, this.services[name]);
};

InProcess.prototype.stop = function(cb) {
  setImmediate(cb);
};