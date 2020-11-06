/***************************
	Global state
***************************/

DEBUGMODE = false;

/***************************
	Math functions
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


/***************************
	String methods
***************************/

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
	let splits = [0, ...indices.map((t=>n=>t+=n)(0)), this.length].uniquify();
	let ret = []
	for (let i = 0; i < splits.length - 1; ++i) {
		ret.push(this.substring(splits[i], splits[i+1]));
	}
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


/***************************
	Array methods
***************************/

// Do a binary search of a sorted array for an element, returning the position
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

// Remove duplicate elements from a sorted array
Array.prototype.uniquify = function() {
	for (let i = this.length - 1; i >= 1; --i) {
		if (this[i-1] === this[i])
			this.splice(i-1,1);
	}
	return this;
};


/***************************
	AJAX Helper functions
***************************/

function ajaxGetRequest(request, successCallback, failureCallback = (response)=>{}) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			successCallback(xhr.responseText);
		}
		else {
			failureCallback(xhr.responseText);
		}
	};
	xhr.open('GET', request);
	xhr.send();
}


/***************************
	DOM Helper functions
***************************/

// Connect "keyup" event (keyCode === 13) of field to "click" event of button
function linkFieldToButton(field, btn) {
	field.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			btn.click();
		}
	});
}

// Connect button to clear & focus a field
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

// Shorthand for document.querySelectorAll
function $$(...args) {
	return document.querySelectorAll(...args);
}