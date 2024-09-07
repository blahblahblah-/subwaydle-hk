import React, { useRef, useEffect, useState } from 'react';
import maplibregl from '!maplibre-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import { todaysTrip, todaysSolution } from '../utils/answerValidations';

import stations from "../data/stations.json";
import routes from "../data/routes.json";
import shapes from "../data/shapes.json";

import './MapFrame.scss';

const MapFrame = (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(114.1694);
  const [lat, setLat] = useState(22.2893);
  const [zoom, setZoom] = useState(12);
  const solution = todaysSolution();

  const stopsGeoJson = () => {
    const stops = [
      solution.origin,
      solution.first_transfer_arrival,
      solution.first_transfer_departure,
      solution.second_transfer_arrival,
      solution.second_transfer_departure,
      solution.destination
    ];
    return {
      "type": "FeatureCollection",
      "features": [...new Set(stops)].map((stopId) => {
        const station = stations[stopId];
        return {
          "type": "Feature",
          "properties": {
            "id": stopId,
            "name": `${station.name_chinese}\n${station.name_english}`,
          },
          "geometry": {
            "type": "Point",
            "coordinates": [station.longitude, station.latitude]
          }
        }
      })
    };
  }

  const lineGeoJson = (line) => {
    const route = routes[line.route];
    let shape;
    const beginCoord = [stations[line.begin].stops[line.route].longitude, stations[line.begin].stops[line.route].latitude];
    const endCoord = [stations[line.end].stops[line.route].longitude, stations[line.end].stops[line.route].latitude];
    let coordinates = [];

    if (line.route === 'EAL') {
      const lineOne = shapes['EAL1'];
      if (lineOne.some((coord) => coord[0] === beginCoord[0] && coord[1] === beginCoord[1]) && lineOne.some((coord) => coord[0] === endCoord[0] && coord[1] === endCoord[1])) {
        shape = shapes['EAL1'];
      } else {
        shape = shapes['EAL2'];
      }
    } else if (line.route === 'TKL') {
      const lineOne = shapes['TKL1'];
      if (lineOne.some((coord) => coord[0] === beginCoord[0] && coord[1] === beginCoord[1]) && lineOne.some((coord) => coord[0] === endCoord[0] && coord[1] === endCoord[1])) {
        shape = shapes['TKL1'];
      } else {
        shape = shapes['TKL2'];
      }
    } else {
      shape = shapes[line.route];
    }

    const beginIndex = shape.findIndex((coord) => coord[0] === beginCoord[0] && coord[1] === beginCoord[1]);
    const endIndex = shape.findIndex((coord) => coord[0] === endCoord[0] && coord[1] === endCoord[1]);

    if (beginIndex < endIndex) {
      coordinates = shape.slice(beginIndex, endIndex + 1);
    } else {
      coordinates = shape.slice(endIndex, beginIndex + 1);
    }

    return {
      "type": "Feature",
      "properties": {
        "color": route.color,
      },
      "geometry": {
        "type": "LineString",
        "coordinates": coordinates
      }
    }
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json',
      center: [lng, lat],
      minZoom: 9,
      zoom: zoom,
      maxPitch: 0,
    });
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    map.current.on('load', () => {
      map.current.resize();
      const trip = todaysTrip();
      const solution = todaysSolution();
      let coordinates = [];
      [
        {
          route: trip[0],
          begin: solution.origin,
          end: solution.first_transfer_arrival,
        },
        {
          route: trip[1],
          begin: solution.first_transfer_departure,
          end: solution.second_transfer_arrival,
        },
        {
          route: trip[2],
          begin: solution.second_transfer_departure,
          end: solution.destination,
        },
      ].forEach((line, i) => {
        const lineJson = lineGeoJson(line);
        coordinates = coordinates.concat(lineJson.geometry.coordinates);
        const layerId = `line-${i}`;
        map.current.addSource(layerId, {
          "type": "geojson",
          "data": lineJson
        });
        map.current.addLayer({
          "id": layerId,
          "type": "line",
          "source": layerId,
          "layout": {
            "line-join": "miter",
            "line-cap": "round",
          },
          "paint": {
            "line-width": 2,
            "line-color": ["get", "color"],
          }
        });
      });
      const stopsJson = stopsGeoJson();
      map.current.addSource("Stops", {
        "type": "geojson",
        "data": stopsJson
      });
      map.current.addLayer({
        "id": "Stops",
        "type": "symbol",
        "source": "Stops",
        "layout": {
          "text-field": ['get', 'name'],
          "text-size": 12,
          "text-font": ['Lato Bold', "Open Sans Bold","Arial Unicode MS Bold"],
          "text-optional": false,
          "text-justify": "auto",
          'text-allow-overlap': false,
          "text-padding": 1,
          "text-variable-anchor": ["bottom-right", "top-right", "bottom-left", "top-left", "right", "left", "bottom"],
          "text-radial-offset": 0.5,
          "icon-image": "express-stop",
          "icon-size": 8/13,
          "icon-allow-overlap": true,
        },
        "paint": {
          "text-color": '#ffffff',
        },
      });
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: {
            top: 50,
            right: 20,
            left: 20,
            bottom: 50,
          },
        });
      }
    });


  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default MapFrame;
