let auction = null
let biddingBox = null;
let system = null;
let content = null;
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
	content.update();
	info.update();
	correctOverflow(".bid-custom");
	//localStorage.setItem("system", system.serialize());
}

function onAjaxError(a, b, c) {
	let modal = new Modal("Failed to load system!");
	modal.appendText(`readyState: ${a.readyState}`);
	modal.appendText(`status: ${a.status}`);
	modal.appendText(`statusText: ${a.statusText}`);
	modal.appendButton("Ok", "grey", function () { modal.close(); });
	modal.open();
}

function initSystem() {
	system = new System();
	auction = new Auction();
	biddingBox = new BiddingBox();
	content = new Content();
	info = new InfoView();
	menu = new Menu();

	// Initialise updates
	update();

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