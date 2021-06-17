// Load dependencies

class ScriptLoader {
	constructor(callback, ...scripts) {
		this.remainingScripts = scripts.length;
		this.callback = callback;

		let head = document.getElementsByTagName("head")[0];
		for (const script of scripts) {
			let elem = document.createElement("script");
			elem.src = script;
			elem.onload = this.onLoad.bind(this);
			head.appendChild(elem);
		}
	}

	onLoad() {
		--this.remainingScripts;
		if (this.remainingScripts === 0)
			this.callback();
	}
}

let scriptLoader = new ScriptLoader(
	initSystem,
	"js/Auction.js",
	"js/Bid.js",
	"js/BiddingBox.js",
	"js/InfoView.js",
	"js/Menu.js",
	"js/Modal.js",
	"js/System.js",
	"js/TreeView.js",
);

let auction = null
let biddingBox = null;
let system = null;
let tree = null;
let info = null;
let menu = null;

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}


/***********************
* Master init & update *
***********************/

function correctOverflow(selector) {
	function hasOverflow(elem) {
		let style = window.getComputedStyle(elem);
		let width = elem.offsetWidth -
			parseFloat(style.getPropertyValue("border-left-width")) -
			parseFloat(style.getPropertyValue("border-right-width"));
		let height = elem.offsetHeight -
			parseFloat(style.getPropertyValue("border-top-width")) -
			parseFloat(style.getPropertyValue("border-bottom-width"));
		return elem.scrollWidth > width || elem.scrollHeight > height;
	}

	let minSize = 6;
	for (const elem of $(selector)) {
		if (!hasOverflow(elem))
			continue;
		let style = window.getComputedStyle(elem).getPropertyValue("font-size");
		let fontSize = parseFloat(style);
		for (let f = fontSize - 1; f > minSize; --f) {
			elem.style.fontSize = f + "px";
			if (!hasOverflow(elem))
				break;
		}
  
	}
}

function update() {
	auction.update();
	biddingBox.update();
	tree.update();
	info.update();
	correctOverflow(".bid-custom");
	//localStorage.setItem("system", system.serialize());
}

function updateHeader() {
	$("#header-name").val(system.info.name);
	$("#header-partnera").val(system.info.partnerA);
	$("#header-partnerb").val(system.info.partnerB);
	$("#header-overview").val(system.info.overview);
}

function initialLoad(data) {
	if (data)
		system.load(data);
	update();
}

function onAjaxError(a, b, c) {
	let $modal = new Modal("Failed to load system!");
	$modal.append(`<div><h2>Failed to load system</h2><p>readyState: ${a.readyState}</p><p>status: ${a.status}</p><p>statusText: ${a.statusText}</p></div>`);
	let $cancel = $("<button>", { "class": "no", "html": "Ok" });
	$cancel.click(function () {
		$modal.close();
	});
	$modal.append($cancel).open();
}

function initSystem() {
	system = new System();
	auction = new Auction();
	biddingBox = new BiddingBox();
	tree = new TreeView();
	info = new InfoView();
	menu = new Menu();
	
	// Load system if provided
	let sysName = findGetParameter("system");
	if (sysName !== null) {
		$.ajax({
			"url": `systems/${sysName}.json`,
			"cache": false,
			"error": onAjaxError,
			"success": function (data) { system.load(data); },
			"dataType": "text"
		});
	}
}