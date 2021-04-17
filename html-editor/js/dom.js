// lib.js: Minimal javascript general library, Copyright (C) Dominic Price 2020 under the MIT Licence

// Get a reference to a single element
// $(selectors, parent): Get the first matching element which matches selectors, starting 
//                       the search at parent (defaults to document)
//                       e.g. $(".header h1")
// $(tag, opts): Create an element and configure it with opts.
//               e.g. $("<div>", { "class": "big", "parent": myelem })
function $(selectors, opts = null) {
	if (selectors[0] === "<" && selectors[selectors.length-1] === ">") {
		let elem = document.createElement(selectors.slice(1, selectors.length - 1));
		if (opts === null)
			return elem;
		for (const [key, val] of Object.entries(opts)) {
			if (key === "class")
				elem.classList.add(val);
			else if (key === "html")
				elem.innerHTML = val;
			else if (key === "id")
				elem.id = val;
			else if (key.startsWith("event:"))
				elem.addEventListener(key.slice(6), val);
			else if (key === "style")
				elem.style.cssText = val;
			else if (key.startsWith("style:"))
				elem.style[((name)=>name[0] + name.split("-").map(x=>x[0].toUpperCase()+x.slice(1)).join("").slice(1))(key.slice(6))] = val;
			else if (key === "parent") 
				val.appendChild(elem);
			else if (key.startsWith("attr:"))
				elem.setAttribute(key.slice(5), val);
			else
				console.log(`Unknown option ${key} passed to constructor of ${selectors} element`);
		}
		return elem;
	}
	else {
		return opts === null ? document.querySelector(selectors) : opts.querySelector(selectors);
	}
}

// Get a NodeList of all elements matching a selector, starting the search at parent (defaults to document)
function $$(selectors, par) {
	return document.querySelectorAll(selectors, par ? par : document);
}

// Binary search a sorted array for an element matching pred
function binSearch(ar, pred) {
    var m = 0;
    var n = ar.length - 1;
    while (m <= n) {
        var k = (n + m) >> 1;
        var cmp = pred(ar[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return k;
        }
    }
    return -1;
}

// Convert a function into a callback which is called in the context of target and has the
// signature function myCallback(target, event, ...boundArgs) where target is the object
// which triggered the event
function callback(context, fn, ...boundArgs) {
	return function(e) { return fn.call(context, e.currentTarget, e, ...boundArgs); }
}


function ready(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
} 