/***************************
	     Callbacks
***************************/

function onFind() {
	$("#output").innerHTML = "Retrieving results...";
	let query = $("#letters").value;
	let endpoint;
	if ($("#synonyms").checked)
		endpoint="words?rel_syn";
	else if ($("#antonyms").checked) 
		endpoint="words?rel_ant";
	else if ($("#homonyms").checked) 
		endpoint="words?sl";
	else if ($("#rhymes").checked) 
		endpoint="words?rel_rhy";
	else if ($("#triggers").checked) 
		endpoint="words?rel_trg";
	else if ($("#completions").checked) 
		endpoint="sug?s";
	
	ajaxGetRequest(`https://api.datamuse.com/words?${endpoint}=${query}`, onReceiveData, onReceiveError);
}

function onReceiveData(response) {
	let output = $("#output");
	output.innerHTML = response;
	
	output.innerHTML += `<div class="footnote">Results kindly powered for free by the <a href="https://www.datamuse.com/api/">Datamuse API</a></div>`;
}

function onReceiveError(response) {
	let output = $("#output");
	output.innerHTML += `<span class="warning">${response}</span>`;
}

/***************************
	   Initialisation
***************************/

function init() {
	$("#find").addEventListener("click", onFind);
}

init();