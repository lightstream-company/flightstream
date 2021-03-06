"use strict";
var $ = require('jquery');
var Backbone = require('backbone');
var Control3D = require('./Control3D');
var DroneLayer = require('./DroneLayer');
var Router = require('./Router');
var Info = require('./Info');
//var lightstream = require('lightstream-socket');
require('mapbox.js');
var L = window.L;
L.mapbox.accessToken = 'pk.eyJ1IjoiZnJhbmNrZXJuZXdlaW4iLCJhIjoiYXJLM0dISSJ9.mod0ppb2kjzuMy8j1pl0Bw';
var MAPBOX_STYLE_ID = 'franckernewein.2e4d602d';

var Model = Backbone.Model.extend({
  getCoordinates: function getCoordinates() {
    return this.get('geojson').coordinates;
  }
});
var Collection = Backbone.Collection.extend({
  model: Model
});
var collection = new Collection();

$(document).ready(function() {

  var map = L.mapbox.map('map', MAPBOX_STYLE_ID, {
    zoomControl: false,
    attributionControl: false,
    tileLayer: {
      noWrap: true
    }
  });

  map.setZoom(18);

  new Control3D({
    map: map,
    el: $('.control-3d'),
  });

  //control.set3dMode();

  var getPxBounds = map.getPixelBounds;
  map.getPixelBounds = function() {
    var bounds = getPxBounds.call(this);
    bounds.min.x = bounds.min.x - 2000;
    bounds.min.y = bounds.min.y - 2000;
    bounds.max.x = bounds.max.x + 2000;
    bounds.max.y = bounds.max.y + 2000;
    return bounds;
  };

  var layer = new DroneLayer({
    collection: collection
  });
  map.on('mousedown', function() {
    $('.control input').attr('checked', false);
  });
  map.addLayer(layer);

  var $follow = $('#follow-drone');
  var $play = $('.control .play');
  var $end = $('.control .end');

  $play.hide();

  var router = new Router({
    collection: collection
  });

  $end.click(function(e){
    e.preventDefault();
    router.goToEnd();
  });

  $play.click(function(e){
    e.preventDefault();
    router.reload();
  });

  collection.on('reset', function() {
    $play.hide();
    $end.show();
    collection.once('add', function(model) {
      map.setView(model.get('geojson').coordinates, map.getZoom());
    });
  });

  collection.on('add', function(model) {
    if ($follow.is(':checked')) {
      map.setView(model.get('geojson').coordinates, map.getZoom());
      model.trigger('active', model);
    }
  });

  collection.on('end', function(){
    $end.hide();
    $play.show();
  });

  var info = new Info({
    el: '.info'
  });
  collection.on('active', function(model) {
    info.render(model);
  });

  $('#flight-selector').change(function(){
    document.location.hash = this.value;
  });
  
  map.on('load', function(){
    Backbone.history.start();
  });
});
