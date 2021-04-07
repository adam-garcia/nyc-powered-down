
<script>
  import { Router, Route, Link } from "svelte-routing";
  import Home from "./views/Home.svelte";
  import About from "./views/About.svelte";
	import fetchLatestData from "./data/fetchLatestData.js"
	import parseCSVData from "./data/parseCSVData.js"

  export let url = "";


	let nyc311Data;
	fetchLatestData().then((res) => {
		nyc311Data = parseCSVData(res.data)
	});

</script>

<Router url="{url}">
	<nav>
		 <Link to="/">Home</Link>
		 <Link to="about">About</Link>
	 </nav>

	 <div>
		 <Route path="/"><Home {nyc311Data} /></Route>
		 <Route path="about" component="{About}" />
	 </div>
 </Router>
