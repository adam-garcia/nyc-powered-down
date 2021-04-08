<script>
  export let nyc311Data;
  let outageMap, filterToOpenValue;
  let filterToOpen = true;
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  // import { map, mapboxgl } from "../modules/map";
  import secrets from "../secrets.js";
  import mapboxgl from "mapbox-gl";

  mapboxgl.accessToken = secrets.MAPBOX_API_TOKEN;

  $: nReports = nyc311Data.length ? nyc311Data.length : 0;
  $: nReportsOpen = nyc311Data.length
    ? nyc311Data.filter((f) => f.status == "Open").length
    : 0;

  onMount(async () => {
    outageMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-74, 40.7], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
  });

  let addFeatures = () => {
    if (outageMap.getLayer("outages")) {
      outageMap.removeLayer("outages")
    };
    if (outageMap.getLayer("outage-points")) {
      outageMap.removeLayer("outage-points")
    };
    if (outageMap.getSource("outage-reports")) {
      outageMap.removeSource("outage-reports")
    };

    const features = nyc311Data
      .filter((d) => d.latitude)
      .filter((d) => dayjs(d.created_date).isAfter("2020-12-31"))
      .filter((d) => {
        return filterToOpenValue.checked ? d.status === "Open" : true
      })
      .map((data, i) => {
        // Hacky? Building out the geojson feature by hand
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
    outageMap.addSource("outage-reports", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: features,
      },
    });
    outageMap.addLayer({
      id: "outages",
      type: "heatmap",
      paint: {
        "heatmap-intensity": 0.6,
        "heatmap-opacity": {
          default: 0.75,
          stops: [
            [12, 0.75],
            [13, 0]
          ]
        },
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 0, 0)",
          0.1,
          "#0d0887",
          0.3,
          "#7e03a8",
          0.5,
          "#cc4778",
          0.7,
          "#f89540",
          1,
          "#f0f921",
        ],
      },
      source: "outage-reports",
    });
    outageMap.addLayer({
      id: "outage-points",
      type: "circle",
      source: "outage-reports",
      minzoom: 12,
      paint: {
        "circle-color": "#f89540"
      },
    });
    outageMap.on("mousemove", "outage-points", (e) => {
      outageMap.getCanvas().style.cursor = "pointer";
    });
    outageMap.on("mouseleave", "outage-points", (e) => {
      outageMap.getCanvas().style.cursor = "";
    });

    outageMap.on("click", function (e) {
      var features = outageMap.queryRenderedFeatures(e.point, {
        layers: ["outage-points"],
      });

      if (!features.length) {
        return;
      }

      var feature = features[0];
      outageMap.getCanvas().style.cursor = "pointer";

      var popup = new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          `<h3>Borough: ${feature.properties.borough}</h3>` +
            `<p>Call date: ${dayjs(feature.properties.created_date).format(
              "MMMM D, YYYY"
            )}<br/>Status: ${feature.properties.status}</p>`
        )
        .addTo(outageMap);
    });
    return "";
  };

</script>

<h2>Home</h2>

<h3>
  {nReports ? nReports.toLocaleString() : "0"}
  Power Outage Calls to 311 in 2021
</h3>
<h3>
  {nReportsOpen ? nReportsOpen.toLocaleString() : "0"}
  are open as of today
</h3>

<label>
  Filter to Open Reports
  <input
    type="checkbox"
    bind:checked={filterToOpen}
    bind:this={filterToOpenValue}
    on:click={addFeatures}
  />
</label>

{#if nyc311Data.length}
  {(addFeatures())}
{/if}
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
    height: 90vh;
  }
  * *:focus,
  *:focus {
    outline: none;
  }
</style>
