import * as d3 from 'd3-dsv';
import dayjs from 'dayjs';

const parseCSVData = (rawData) => {
  return d3.csvParse(rawData).map((incident, i) => {
    return {
      index_number: i,
      unique_key: incident.unique_key,
      created_date: dayjs(incident.created_date),
      closed_date: dayjs(incident.closed_date),
      agency: incident.agency,
      agency_name: incident.agency_name,
      complaint_type: incident.complaint_type,
      descriptor: incident.descriptor,
      location_type: incident.location_type,
      incident_zip: incident.incident_zip,
      incident_address: incident.incident_address,
      street_name: incident.street_name,
      address_type: incident.address_type,
      city: incident.city,
      status: incident.status,
      resolution_description: incident.resolution_description,
      resolution_action_updated_date: dayjs(incident.resolution_action_updated_date),
      community_board: incident.community_board,
      bbl: incident.bbl,
      borough: incident.borough,
      x_coordinate_state_plane: incident.x_coordinate_state_plane,
      y_coordinate_state_plane: incident.y_coordinate_state_plane,
      open_data_channel_type: incident.open_data_channel_type,
      park_facility_name: incident.park_facility_name,
      latitude: +incident.latitude,
      longitude: +incident.longitude,
    }
  })
  .filter(d => d.created_date.year() == dayjs().year())
}

export default parseCSVData;
