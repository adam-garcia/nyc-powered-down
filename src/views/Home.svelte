<script>
  export let nyc311Data;
  import beautify from "json-beautify";
  import mapboxgl from "mapbox-gl";
  import { onMount } from "svelte";
  import dayjs from 'dayjs';
  import secrets from "../secrets.js"
  let map;

  onMount(async () => {
    mapboxgl.accessToken = secrets.MAPBOX_API_TOKEN;
    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-74, 40.7], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
    map.on("load", function () {
      const features = nyc311Data
        // .slice(0, 5)
        .filter((d) => d.latitude)
        .map((data, i) => {
          if (i === 0) {
            console.log(data)
          }
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [data.longitude, data.latitude],
            },
            properties: {
              ...data,
            },
          };
        });
      // Add an image to use as a custom marker
      map.loadImage("dot.png", function (error, image) {
        if (error) throw error;
        map.addImage("custom-marker", image);
        // Add a GeoJSON source with 2 points
        map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features,
          },
        });

        // Add a symbol layer
        map.addLayer({
          id: "outages",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
          },
        });
      });
    });

    map.on("click", function (e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ["outages"], // replace this with the name of the layer
      });

      if (!features.length) {
        return;
      }

      var feature = features[0];

      console.log(feature.properties)

      var popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          `<h3>Borough: ${feature.properties.borough}</h3>` +
          `<p>Call date: ${dayjs(feature.properties.created_date).format("MMMM D, YYYY")}<br/>Status: ${feature.properties.status}</p>`
        )
        .addTo(map);
    });
  });
</script>

<h2>Home</h2>

<div class="map_container">
  <div id="map" />
</div>

<style>
  .map_container {
    max-width: 800px;
    margin: 0 auto;
  }
  #map {
    width: 100%;
    height: 70vh;
  }
</style>
