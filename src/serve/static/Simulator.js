from util.browser import $;

import .util.ajax;
import .util.DeviceInfo as DeviceInfo;

import .ui.Chrome;

import .API;
import .util.upgrade;

var defaultParentNode = document.querySelector('devkit') || document.body;

exports = Class(function () {
  var _simulatorId = 0;

  this.init = function (opts) {
    this._opts = opts;
    this.id = opts.id || ('sim' + (++_simulatorId));

    this._type = opts.type;
    this._screen = opts.screen;
    this._userAgent = opts.userAgent;

    this._app = opts.app;
    this._manifest = opts.manifest;

    this._deviceInfo = DeviceInfo.get(this._opts.type);
    this._buildTarget = opts.buildTarget || this._deviceInfo.getTarget();

    // api used by simulator frame
    this.api = new API(this);

    // DOM simulator
    this._ui = new ui.Chrome(this);

    this._modules = {};
    this.loadModules(opts.modules);
    this.rebuild();
  };

  this.getUI = function () {
    return this._ui;
  };

  this.getApp = function () { return this._app; }
  this.getOpts = function () { return this._opts; };
  this.getManifest = function () { return this._manifest; };

  this.loadModules = function (modules) {
    if (!modules) { return; }

    Object.keys(modules).forEach(function (name) {
      if (name in this._modules) { return; }

      this._modules[name] = $({
        parent: this._opts.parent || defaultParentNode,
        tag: 'iframe',
        src: modules[name],
        className: 'module-frame'
      });
    }, this);
  };

  this.rebuild = function (cb) {
    this._ui.setBuilding(true);
    // get or update a simulator port with the following options
    return util.ajax
      .get({
        url: '/api/simulate/',
        query: {
          app: this._app,
          deviceType: this._type,
          deviceId: this.id,
          scheme: 'debug',
          target: this._buildTarget
        }
      })
      .bind(this)
      .then(function (res) {
        var res = res[0];
        this._ui.setBuilding(false);
        this.setURL(res.url);
        this.loadModules(res.debuggerURLs);
      }, function (err) {
        var errString = 'Unable to simulate: ' + this._app;
        if (err.response && err.response.message) {
          errString += '\n\n' + err.response.message + '\n' + err.response.stack;
        }
        logger.error(errString);
        console.error(err);
      })
      .nodeify(cb);
  };

  this.setURL = function (url) {
    this._ui.loadURL(url);
  };
});
