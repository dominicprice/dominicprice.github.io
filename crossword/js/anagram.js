/***************************
	     Callbacks
***************************/

function onSetLengthsError() {
	$("#length-error").innerHTML = "Lengths do not add up to number of letters";
	$("#lengths").classList.add("input-error");
	$("#lengths").focus();
	$("#lengths").select();
}

function onClearLengthsError() {
	$("#length-error").innerHTML = "";
	$("#lengths").classList.remove("input-error");
}

function onSolveAnagram() {
	// Get form values
	let letters = $("#letters").value.replace(/\s/g, '').toLowerCase().sort();
	let lengths = $("#lengths").value.match(/\d+/g);
	lengths = lengths ? lengths.map(Number) : [ letters.length ];
	// Do nothing if no letters specified
	if (letters.length === 0)
		return;

	// Display error if lengths does not add up to number of letters
	if (lengths.reduce((t,n)=>{return t+n;}) != letters.length) {
		onSetLengthsError();
		return;
	}

	// Set up variables
	let i = 0; // Number of permutations tested so far
	const n = letters.nPerms(); // Total number of permutations
	const maxIterations = DEBUGMODE ? 500 : 50000; // Number of iterations to do per timeout cycle
	let stopExecution = false; // User-interrupt flag
	let startTime = Date.now(); // Calculation start time
	
	// Toggle button states
	$("#solve").toggleAttribute("disabled", true);
	$("#reset").classList.add("hidden");
	$("#stop").addEventListener("click", function() { stopExecution = true; });
	$("#stop").classList.remove("hidden");
	
	// Set up output area
	$("#output").innerHTML = `<ul id="results"></ul>`;
		
	// Loop callback
	let loop = function() {
		for (let k = 0; k < maxIterations; ++k) {
			// Check if this permutation is a valid series of words
			let exists = true;
			let words = letters.splitAt(lengths);
			for (const word of words) {
				if (wordList.binSearch(word) === -1) {
					exists = false;
					break;
				}
			}
			// Add to output if valid
			if (exists) 
				$("#results").innerHTML += `<li>${words.join(" ")}</li>`;
			
			// Check for exit conditions
			if (stopExecution || letters === (letters = letters.nextPermutation())) 
				return onFinishSolve(stopExecution, startTime);
		}

		// Update progress counter
		i += maxIterations;
		$("#solve").innerHTML = `${Math.floor(100 * i / n)}%`;
		
		// Call new loop cycle
		setTimeout(loop, 0);
	};

	// Start calculation
	setTimeout(loop, 0);
}

function onFinishSolve(forcedExit, startTime) {
	// End timer
	let totalTime = (Date.now() - startTime) / 1000;
	
	// Toggle button states
	$("#solve").toggleAttribute("disabled", false);
	$("#solve").innerHTML = "Solve";
	$("#reset").classList.remove("hidden");
	$("#stop").parentNode.replaceChild($("#stop").cloneNode(true), $("#stop"));
	$("#stop").classList.add("hidden");
	
	// Display extra info if user didn't abort search
	if (!forcedExit) {
		if ($("#results").childElementCount === 0)
			$("#results").innerHTML = `<li class="failure">No results found</li>`;			
		$("#output").innerHTML += `<div class="footnote">Search complete in ${totalTime}s</div>`;
	}
}


/***************************
	   Initialisation
***************************/

function init() {
	linkFieldToButton($("#letters"), $("#solve"));
	btnClearAndFocus($("#clear-letters"), $("#letters"));
	linkFieldToButton($("#lengths"), $("#solve"));
	btnClearAndFocus($("#clear-lengths"), $("#lengths"));
	
	$("#lengths").addEventListener("input", onClearLengthsError);
	$("#clear-lengths").addEventListener("click", onClearLengthsError);
	$("#solve").addEventListener("click", onSolveAnagram);
	
	$("#reset").addEventListener("click", function() {
		$("#output").innerHTML = "";
		$("#lengths").value = "";
		resetLengths();
		$("#letters").value = "";
		$("#letters").focus();
	});
	
	$("#letters").focus();
}

init();