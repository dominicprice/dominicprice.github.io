/***************************
	General routines
***************************/

// Returns the factorial n!/d!
function factorial(n, d=1)
{
	if (n < 2) return 1;
    var ret=d+1;
    for (var i = d+2; i <= n; i++)
        ret *= i;
    return ret;
}

// Returns the number of permutations of objects, where counts enumerates
// the number of each identical objects in the list, e.g. "aabc" => counts is [2,1,1]
function nPerms(counts) {
	return factorial(counts.reduce((t,n)=>{return t+n}))/counts.reduce((t,n)=>{return t*factorial(n);},1);
}

// Returns a string with the characters at i1 and i2 swapped
String.prototype.swap = function(i1, i2) {
	if (i1 === i2)
		return this;
	if (i1 > i2) {
		let tmp = i1;
		i1 = i2;
		i2 = tmp;
	}
	return this.substring(0, i1) + this[i2] + this.substring(i1 + 1, i2) + this[i1] + this.substring(i2 + 1);
}

// Reverses a string
String.prototype.reverse = function() {
	return [...this].reverse().join("");
}

// Sorts a string alphabetically
String.prototype.sort = function() {
	return [...this].sort().join("");
}

// Split a string at the specified locations
String.prototype.splitAt = function(indices) {
	let ret = [];
	let start = 0;
	for (let i = 0; i < indices.length; ++i) {
		if (start != indices[i])
			ret.push(this.substring(start, indices[i]));
		start = indices[i];
	}
	if (start != this.length)
		ret.push(this.substring(start));
	return ret;
}

// Return the next permutation of a string. Based on
// https://en.cppreference.com/w/cpp/algorithm/next_permutation
String.prototype.nextPermutation = function() {
	let first = 0, last = this.length;
	if (first === last)
		return this.valueOf();
	let i = last;
	if (first === --i)
		return this.valueOf();
	
	while (true) {
		let i1 = i;
		if (this[--i] < this[i1]) {
			let i2 = last;
			while (!(this[i] < this[--i2]));
			let s = this.swap(i, i2);
			let s1 = s.substring(0, i1);
			let s2 = s.substring(i1).reverse();
			return s1 + s2;
		}
		if (i === first) {
			return this.valueOf();
		}
	}
}

// Returns the number of possible permutations of a string
String.prototype.nPerms = function() {
	let counts = {};
	for (const letter of this) {
		if (counts.hasOwnProperty(letter))
			counts[letter] += 1;
		else
			counts[letter] = 1;
	}
	return nPerms(Object.values(counts));
}

// Do a binary search of an array for an element, returning the position
// if it exists otherwise -1
Array.prototype.binSearch = function(elem) {
	var m = 0;
	var n = this.length - 1;
	while (m <= n) {
		var k = (n + m) >> 1;
		if (elem > this[k]) {
			m = k + 1;
		} else if(elem < this[k]) {
			n = k - 1;
		} else {
			return k;
		}
	}
	return -1;
}


/***************************
	DOM Helper functions
***************************/

function setIntervalUntil(callback, interval, condition) {
	callback();
	let iv = setTimeout(function() {
		if (condition()) 
			clearInterval(iv);
		else {
			callback();
			setIntervalUntil(callback, interval, condition);
		}
	}, interval);
}

// Connect "keyup" event (keyCode === 13) of field to "click" event of button
function linkFieldToButton(field, btn) {
	field.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			btn.click();
		}
	});
}

function btnClearAndFocus(btn, field) {
	btn.addEventListener("click", function() {
		field.value = "";
		field.focus();
	});
}

// Shorthand for document.querySelector
function $(...args) {
	return document.querySelector(...args);
}


/***************************
	     Callbacks
***************************/

function onSolveAnagram() {
	let letters = $("#letters").value.replace(/\s/g, '').toLowerCase().sort();
	let lengths = $("#lengths").value.match(/\d+/g);
	if (lengths)
		lengths = lengths.map(Number);
	else
		lengths = [ letters.length ];
	let output = $("#output");
	
	// Clear output;
	output.innerHTML = "";

	// Do nothing if no letters specified
	if (letters.length === 0)
		return;

	if (lengths.reduce((t,n)=>{return t+n;}) != letters.length) {
		output.innerHTML = "<span class='warning'>Lengths do not add up to number of letters</span>";
		return;
	}

	// Set up output
	let i = 0;
	let n = letters.nPerms();
	let stopExecution = false;
	let timer = Date.now();
	$("#stop").toggleAttribute("disabled", false);
	$("#solve").toggleAttribute("disabled", true);
	$("#stop").addEventListener("click", function() { stopExecution = true; });
	let ul = document.createElement("ul");
	output.appendChild(ul);
		
	// Loop callback
	let loop = function() {
		// Just looks nicer to have it not always increment uniformly...
		const maxIterations = 50000;
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
			if (exists) {
				let li = document.createElement("li");
				li.innerHTML = words.join(" ");
				ul.appendChild(li);
			}
			
			// Exit condition check 1: user has clicked stop
			if (stopExecution) {
				$("#stop").toggleAttribute("disabled", true);
				$("#solve").toggleAttribute("disabled", false);
				$("#solve").innerHTML = "Solve";
				$("#progress").innerHTML = "Search aborted";
				return;
			}
			
			// Exit condition check 2: reached the last permutation
			if (letters === (letters = letters.nextPermutation())) {
				$("#stop").toggleAttribute("disabled", true);
				$("#solve").toggleAttribute("disabled", false);
				$("#solve").innerHTML = "Solve";
				$("#output").innerHTML += `<div class="footnote">Search complete in ${(Date.now() - timer) / 1000}s</div>`;
				if (ul.childElementCount === 0) {
					let li = document.createElement("li");
					li.innerHTML = "No results found";
					li.classList.add("failure");
					ul.appendChild(li);	
				}
				return;
			}
		}
		
		// Update progress display
		i += maxIterations;
		$("#solve").innerHTML = `${Math.floor(100 * i / n)}%`;
		setTimeout(loop, 0);
	};

	setTimeout(loop, 0);
}


/***************************
	   Initialisation
***************************/

function init() {
	// Anagram Solver
	linkFieldToButton($("#letters"), $("#solve"));
	btnClearAndFocus($("#clear-letters"), $("#letters"));
	linkFieldToButton($("#lengths"), $("#solve"));
	btnClearAndFocus($("#clear-lengths"), $("#lengths"));
	
	$("#solve").addEventListener("click", onSolveAnagram);
	
}

init();