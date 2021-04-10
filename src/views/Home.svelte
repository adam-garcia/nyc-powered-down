<script>
  export let nyc311Data;
  let outageMap, filterToOpenValue, feature, popup, showNTA;
  let filterToOpen = true;
  showNTA = false;
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import mapboxgl from "mapbox-gl";
  import * as axios from "axios";

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
      maxZoom: 14,
      minZoom: 9,
    }).addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
      })
    );
  });

  let toggleOpen = () => {
    filterToOpen = !filterToOpen;
    addFeatures();
  };
  //   const boro = cd.properties.boro_cd.substr(0, 1);
  //   const districtNumber = cd.properties.boro_cd.substr(2, 3);
  //   outageMap.getCanvas().style.cursor = "pointer";
  const boros = ["Manhattan", "Bronx", "Brooklyn", "Queens", "Staten Island"];

  let toggleNTA = () => {
    axios
      .get("https://data.cityofnewyork.us/resource/jp9i-3b7y.geojson")
      .then((res) => {
        res.data.features = res.data.features.map((feature) => {
          const boro = feature.properties.boro_cd.substr(0, 1);
          const cd = +feature.properties.boro_cd.substr(1);
          feature.properties.cd = `${boros[+boro - 1]}\nDistrict ${cd}`;
          return feature;
        });
        if (!outageMap.getSource("nbhd-data")) {
          outageMap.addSource("nbhd-data", {
            type: "geojson",
            data: res.data,
          });
        }
        if (outageMap.getLayer("nbhd-polygons")) {
          outageMap.removeLayer("nbhd-polygons");
          outageMap.removeLayer("nbhd-labels");
        } else {
          outageMap.addLayer({
            source: "nbhd-data",
            id: "nbhd-polygons",
            type: "fill",
            paint: {
              "fill-color": "rgba(13, 12, 69, 0.420)",
              "fill-outline-color": "#000000",
            },
          });
          outageMap.addLayer({
            source: "nbhd-data",
            id: "nbhd-labels",
            type: "symbol",
            layout: {
              "text-field": ["get", "cd"],
              "text-size": 12,
            },
          });
        }
        showNTA = !showNTA;
        addFeatures();
      });
  };

  let addFeatures = () => {
    if (outageMap.getLayer("outages")) {
      outageMap.removeLayer("outages");
    }
    if (outageMap.getLayer("outage-points")) {
      outageMap.removeLayer("outage-points");
    }
    if (outageMap.getSource("outage-reports")) {
      outageMap.removeSource("outage-reports");
    }

    const features = nyc311Data
      .filter((d) => d.latitude)
      .filter((d) => dayjs(d.created_date).isAfter("2020-12-31"))
      .filter((d) => {
        return filterToOpen ? d.status === "Open" : true;
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
            [13, 0],
          ],
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
        "circle-color": "rgba(248, 149, 64, 0.7)",
        "circle-radius": {
          base: 1.75,
          stops: [
            [12, 6],
            [14, 18],
          ],
        },
      },
    });
    outageMap.on("mousemove", "outage-points", (e) => {
      outageMap.getCanvas().style.cursor = "pointer";
    });
    outageMap.on("mouseleave", "outage-points", (e) => {
      outageMap.getCanvas().style.cursor = "";
    });

    outageMap.on("click", function (e) {
      const features = outageMap.queryRenderedFeatures(e.point, {
        layers: ["outage-points"],
      });

      if (!features.length) {
        return;
      }

      feature = features[0];
      outageMap.getCanvas().style.cursor = "pointer";

      if (popup) {
        popup.remove();
      }
      popup = new mapboxgl.Popup({ offset: [0, -15] })
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

  let clearPopup = (e) => {
    if (popup && e.target.nodeName !== "CANVAS") {
      popup.remove();
      feature = undefined;
    }
  };
</script>

<div on:click={clearPopup}>
  <h2 class="is-text-primary">Home</h2>

  {#if feature}
    {JSON.stringify(feature.properties)}
  {/if}

  {#if nyc311Data.length}
    {addFeatures()}
  {/if}

  <div class="columns">
    <div class="column is-3">
      <h3>
        {nReports ? nReports.toLocaleString() : "Loading..."}
        Power Outage Calls to 311 in 2021
      </h3>
      <h3>
        {nReportsOpen ? nReportsOpen.toLocaleString() : "Loading..."}
        are open as of today
      </h3>

      <button on:click={toggleOpen}>
        Show {filterToOpen ? "All" : "Open"} Incidents
      </button>

      <button on:click={toggleNTA}>
        {showNTA ? "Hide" : "Show"}
        Neighborhood Boundaries
      </button>
    </div>
    <div class="column is-9">
      <div id="map" />
    </div>
  </div>
</div>

<style>
  #map {
    height: 90vh;
  }
  * *:focus,
  *:focus {
    outline: none;
  }
</style>
