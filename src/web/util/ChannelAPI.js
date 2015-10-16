import .Channel;

exports = Class(function () {

  this.init = function () {
    this._channels = {};
  };

  this.getChannel = function (name) {
    var channel = this._channels[name];
    if (!channel) {
      channel = new Channel(name);
      this._channels[name] = channel;
    };

    return channel;
  };

  this.setTransport = function (transport) {
    for (var name in this._channels) {
      this._channels[name].setTransport(transport);
    }
  };
});
