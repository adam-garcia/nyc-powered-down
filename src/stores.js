import { writable } from 'svelte/store'



let nyc311Data;
	fetchLatestData().then((res) => {
		nyc311Data = parseCSVData(res.data)
	});
