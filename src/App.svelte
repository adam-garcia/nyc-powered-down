
<script>
  import { Router, Route, Link } from "svelte-routing";
  import Home from "./views/Home.svelte";
  import About from "./views/About.svelte";

  export let url = "";
</script>

<Router url="{url}">
	<nav>
		 <Link to="/">Home</Link>
		 <Link to="about">About</Link>
	 </nav>

	 <div>
		 <Route path="/"><Home /></Route>
		 <Route path="about" component="{About}" />
	 </div>
 </Router>
