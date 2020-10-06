function initLogo() {
	let $parentNode = $("#logo");
	$parentNode.empty();
	// Loop through all bids
	for (let level = 1; level < 8; ++level) {
		for (const denom of ["clubs", "diams", "hearts", "spades", "nt"]) {
			// Generate a test number; we want about 7 bids so that is 5
			// with a 7NT and a PASS bid so we check that it is < 0.2 
			// or we have reached 7NT
			let test = Math.random();
			if (test < 0.2 || (level == 7 && denom == "nt")) {
				let $bid = $("<div class='bid'></div>");
				// Create a redouble 0.5% of the time
				if (test < 0.005) {
					$bid.addClass("bid-redouble");
				}
				// Create a double 2% of the time
				else if (test < 0.02) {
					$bid.addClass("bid-double");
				}	
				// Create a bid using the current value
				else {
					$bid.addClass("bid-" + denom)
					$bid.addClass("bid-level" + level);
				}
				$bid.appendTo($parentNode);
			}
		}
	}
	// Append the pass
	let $pass = $("<div class='bid bid-pass'></div>");
	$pass.appendTo($parentNode);

	// Add event listener
	$parentNode.unbind().click(initLogo);
}


let quotes = [
	{
		"quote": "The real test of a bridge player isn't in keeping out of trouble, but in escaping once he's in.",
		"author": "Alfred Sheinwold"
	},
	{
		"quote": "Having sex is like playing bridge. If you don't have a good partner, you'd better have a good hand.",
		"author": "Woody Allen"
	},
	{
		"quote": "It's not enough to win the tricks that belong to you. Try also for some that belong to the opponents.",
		"author": "Alfred Sheinwold"
	},
	{
		"quote": "When I take a 50-50 chance I expect it to come off 8 or 9 times out of 10.",
		"author": "Hideous Hog"
	},
	{
		"quote": "If 3NT is a viable option - then bid it.",
		"author": "Paul Soloway"
	}
];

function initQuotes() {
	const changeTime = 10000;
	let n = Math.floor(Math.random() * quotes.length);
	let quote = quotes[n];

	$("#quote").html(`“${quote.quote}” &mdash; ${quote.author}`);
	setTimeout(initQuotes, changeTime);
}