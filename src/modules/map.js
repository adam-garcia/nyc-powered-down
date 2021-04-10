import secrets from "../secrets.js";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = secrets.MAPBOX_API_TOKEN;


const map = {
  new: () => {
    return new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [-74, 40.7], // starting position [lng, lat]
      zoom: 9, // starting zoom
    })
  }
};
export default map;
