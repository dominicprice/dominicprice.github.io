/***************************
	     Callbacks
***************************/

function onFind() {
	let query = $("#letters").value.replace(/\s+/g, "+").toUpperCase().replace(/[^A-Z\+]/g, "");
	$("#output").innerHTML = `Retrieving results for "${query}"`;
	let endpoint;
	if ($("#meanslike").checked)
		endpoint="words?ml";
	else if ($("#synonyms").checked)
		endpoint="words?rel_syn";
	else if ($("#antonyms").checked) 
		endpoint="words?rel_ant";
	else if ($("#soundslike").checked) 
		endpoint="words?sl"
	else if ($("#homophones").checked) 
		endpoint="words?rel_hom";
	else if ($("#rhymes").checked) 
		endpoint="words?rel_rhy";
	else if ($("#approxrhymes").checked) 
		endpoint="words?rel_nry";
	else if ($("#triggers").checked) 
		endpoint="words?rel_trg";
	else if ($("#completions").checked) 
		endpoint="sug?s";
	
	ajaxGetRequest(`https://api.datamuse.com/${endpoint}=${query}`, onReceiveData, onReceiveError);
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
	output.innerHTML += `<span class="warning">An error occurred when attempting to get results. The response from the server is printed below</span>`;
	output.innerHTML += response;
}

/***************************
	   Initialisation
***************************/

function init() {
	linkFieldToButton($("#letters"), $("#find"));
	btnClearAndFocus($("#clear-letters"), $("#letters"));
	
	$("#find").addEventListener("click", onFind);
}

init();