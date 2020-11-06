/***************************
	     Callbacks
***************************/

function createInputBox() {
	let res = document.createElement("div");
	res.classList.add("inputbox");
	res.innerHTML = `
		<input type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="off" placeholder="Enter word or phrase here" id="letters">
		<select>
		<option>Similar Meaning</option>
		<option>Similar Sound</option>
		<option>Similar Spelling</option>
		<option>Associated Nouns</option>
		<option>Associated Adjectives</option>
		<option>Synonyms</option>
		<option>Triggers</option>
		<option>Antonyms</option>
		<option>Hypernyms</option>
		<option>Hyponyms</option>
		<option>Holonyms</option>
		<option>Meronyms</option>
		<option>Frequent followers</option>
		<option>Frequent Predecessors</option>
		<option>Rhymes</option>
		<option>Approximate Rhymes</option>
		<option>Homophones</option>
		<option>Consonant Match</option>
	</select>
	<button class="red">&#x2716;</button>`;
	
	res.getElementsByTagName("button")[0].addEventListener("click", onRemoveInputBox);
	linkFieldToButton(res.getElementsByTagName("input")[0], $("#find"));
	
	return res;
}

function onAddInputBox() {
	$("#input-boxes").appendChild(createInputBox());
}

function onRemoveInputBox() {
	this.parentNode.remove();
	if ($("#input-boxes").childElementCount === 0)
		onAddInputBox();
}

function onReset() {
	$("#input-boxes").innerHTML = "";
	onAddInputBox();
}

function onToggleHelp() {
	$("#helpbox").classList.toggle("hidden");
}

function onFind() {
	$("#output").innerHTML = "Building query...";
	let request = "https://api.datamuse.com/words?"
	for (const ibox of $$(".inputbox")) {
		let searchTerm = ibox.getElementsByTagName("input")[0].value;
		let endPoint = ibox.getElementsByTagName("select")[0].value;
		let query;
		
		if (endPoint === "Similar Meaning")
			query = "ml";
		else if (endPoint === "Similar Sound")
			query = "sl";
		else if (endPoint === "Similar Spelling")
			query = "sp";
		else if (endPoint === "Associated Nouns")
			query = "rel_jja";
		else if (endPoint === "Associated Adjectives")
			query = "rel_jjb";
		else if (endPoint === "Synonyms")
			query = "rel_syn";
		else if (endPoint === "Triggers")
			query = "rel_trg";
		else if (endPoint === "Antonyms")
			query = "rel_ant";
		else if (endPoint === "Hypernyms")
			query = "rel_spc";
		else if (endPoint === "Hyponyms")
			query = "rel_gen";
		else if (endPoint === "Holonyms")
			query = "rel_com";
		else if (endPoint === "Meronyms")
			query = "rel_par";
		else if (endPoint === "Frequent Followers")
			query = "rel_bga";
		else if (endPoint === "Frequent Predecessors")
			query = "rel_bgb";
		else if (endPoint === "Rhymes")
			query = "rel_rhy";
		else if (endPoint === "Approximate Rhymes")
			query = "rel_nry";
		else if (endPoint === "Homophones")
			query = "rel_hom";
		else if (endPoint === "Consonant Match")
			query = "rel_cns";
		else 
			continue;
		
		if (endPoint === "Similar Spelling") {
			request += query + "=" + searchTerm.replace(/\s+/g, "+").toUpperCase().replace(/[^A-Z\+\*\?]/g, "") + "&";
		}
		else {
			request += query + "=" + searchTerm.replace(/\s+/g, "+").toUpperCase().replace(/[^A-Z\+]/g, "") + "&";
		}
	}
	
	$("#output").innerHTML = "Sending request...";
	ajaxGetRequest(request, onReceiveData, onReceiveError);
}

function onReceiveData(response) {
	let output = $("#output");
	output.innerHTML = `<ul id="results"></ul>`;
	for (const entry of JSON.parse(response))
		$("#results").innerHTML += `<li>${entry.word}</li>`;
	if ($("#results").childElementCount === 0)
		$("#results").innerHTML = `<li class="failure">No results found</li>`;			
	output.innerHTML += `<div class="footnote">Results kindly powered for free by the <a href="https://www.datamuse.com/api/" target="_blank">Datamuse API</a></div>`;
}

function onReceiveError(response) {
	let output = $("#output");
	console.log("Response from server:", response);
	output.innerHTML += `<div class="warning">An error occurred when attempting to get results.</div>`;
}

/***************************
	   Initialisation
***************************/

function init() {
	$("#new-input-box").addEventListener("click", onAddInputBox);
	$("#find").addEventListener("click", onFind);
	$("#reset").addEventListener("click", onReset);
	$("#help").addEventListener("click", onToggleHelp);
	onAddInputBox();
}

init();