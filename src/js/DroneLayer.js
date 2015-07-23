"use strict";
var _ = require('lodash');
require('mapbox.js');
//var $ = require('jquery');
var L = window.L;
var Marker = require('./Marker');


module.exports = L.Class.extend({

  _zoomAnimated: true,

  initialize: function() {
    this.markers = [];
  },

  onAdd: function(map) {
    this._map = map;
    this._el = L.DomUtil.create('div', 'drone-layer leaflet-zoom-hide');
    map.getPanes().overlayPane.appendChild(this._el);
    map.on('viewreset', this._reset, this);
    this._reset();
  },

  onRemove: function(map) {
    map.getPanes().overlayPane.removeChild(this._el);
    map.off('viewreset', this._reset, this);
  },

  _reset: function() {
    _.each(this.markers, function(marker) {
      marker.setPosition();
      marker.setHeight();
    });
  },

  _animateZoom: function() {
    //TODO
    //should animated marker instead of use leaflet-zoom-hide
  },

  appendMarker: function(item) {
    if (item.geojson.coordinates[0] && item.geojson.coordinates[1]) {
      this.markers.push(new Marker({
        data: item,
        layer: this
      }));
      var length = this.markers.length;
      if (length > 1) {
        var start = this.markers[length - 2].data.geojson.coordinates;
        var stop = this.markers[length - 1].data.geojson.coordinates;
        L.polyline([start, stop], {
          weight: 2,
          color: 'white',
          fill: false,
          clickable: false
        }).addTo(this._map);
      }
    }
  }

});
