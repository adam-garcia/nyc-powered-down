import * as axios from 'axios'
const NYC311URL = "https://data.cityofnewyork.us/resource/erm2-nwe9.csv?" +
  "$order=created_date%20DESC&complaint_type=ELECTRIC&descriptor=POWER%20OUTAGE"

const fetchLatestData = async () => {
  return axios.get(NYC311URL);
}

export default fetchLatestData;
