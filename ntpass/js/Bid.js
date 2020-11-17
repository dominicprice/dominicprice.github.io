let denoms = ["clubs", "diams", "hearts", "spades", "nt"];
let levels = [1, 2, 3, 4, 5, 6, 7];

function replaceSuitSymbols(s) {
	return s
		.replace(/![cC]/g, "&clubs;")
		.replace(/![dD]/g, "&diams;")
		.replace(/![hH]/g, "&hearts;")
		.replace(/![sS]/g, "&spades;");
}

function incrementBid(bid, k) {
    bid = {
        denom: bid.denom,
        level: bid.level
    };
    for (let i = 0; i < k; ++i) {
        switch (bid.denom) {
            case "clubs": bid.denom = "diams"; break;
            case "diams": bid.denom = "hearts"; break;
            case "hearts": bid.denom = "spades"; break;
            case "spades": bid.denom = "nt"; break;
            case "nt": bid.denom = "clubs"; ++bid.level; break;
		}
    }
    return bid;
}

class Bid {
    constructor(name, parent = null, opts = {}) {
        this.name = name;
        this.convention = null;
        this.description = {
            "text": "",
            "alertable": false,
            "minHCP": null,
            "maxHCP": null
        };
        this.children = [];
        if (parent !== null)
            parent.getChildren().push(this);

        for (const [key, value] of Object.entries(opts)) {
            if (key === "description") {
                if (typeof value === "string")
                    this.description.text = value;
                else
                    this.description = value;
            }
            else if (key === "children")
                this.children = value;
            else if (key === "convention")
                this.convention = value;
            else
                console.log(`Unknown option for Bid ${key}=${value} ignored`);
        }
    }

    getChildren() {
        if (this.convention === null)
            return this.children;
        return system.conventions[this.convention];
	}

    getHistory() {
        // Check if opening bid
        for (const bid of system.openings) {
            if (this === bid)
                return [];
        }

        let history = []
        for (const bid of auction.bids) {
            if (this === bid)
                return history;
            history.push(bid);
            for (const child of bid.getChildren()) {
                if (this === child) {
                    return history;
				}
			}
        }

        throw "Could not determine history"
	}

    resolveMinHCP() {
        let history = this.getHistory().reverse();
        history.unshift(this);
        for (let i = 0; i < history.length; i += 4) {
            if (history[i].description.minHCP != null)
                return history[i].description.minHCP;
        }
        return 0;
    }

    resolveMaxHCP() {
        let history = this.getHistory().reverse();
        history.unshift(this);
        for (let i = 0; i < history.length; i += 4) {
            if (history[i].description.maxHCP != null)
                return history[i].description.maxHCP;
        }
        return 37;
    }

    resolveName() {
        if (typeof this.name === "number") {
            // Get 
            let history = this.getHistory();
            for (let i = history.length - 1; i >= 0; --i) {
                let hName = history[i].resolveName();
                if (typeof hName === "string") {
                    if (hName.match(/^(pass|double|redouble)$/))
                        continue;
                    else
                        return `${this.name} Step${this.name === 1 ? '' : 's'}`;
                }
                else if (hName.hasOwnProperty("denom")) {
                    return incrementBid(hName, this.name);
                }
                else {
                    console.log(history[i], hName);
                    return {
                        "from": incrementBid(hName.from, this.name),
                        "to": incrementBid(hName.to, this.name)
					}
				}
            }
            return incrementBid({ "denom": "nt", "level": 0 }, this.name);
        }
        else {
            return this.name;
		}
	}

    draw(addTooltip = false, $elem = null) {
        if ($elem === null)
            $elem = $("<div>", { "class": "bid" });
        else
            $elem.removeClass().html("").css("fontSize", "").addClass("bid");

        let name = this.resolveName();
        if (typeof name === "string") {
            if (name.match(/^(pass|double|redouble)$/)) {
                $elem.addClass("bid-" + name)
            }
            else {
                $elem.addClass("bid-custom");
                $elem.html(replaceSuitSymbols(name));
            }
        }
        else {
            if (name.hasOwnProperty("denom")) {
                $elem.addClass(`bid-${name.denom} bid-level${name.level}`);
            }
            else {
                let $from = $("<span>", { "class": `bid bid-multi bid-${name.from.denom} bid-level${name.from.level}` });
                let $to = $("<span>", { "class": `bid bid-multi bid-${name.to.denom} bid-level${name.to.level}` });
                $elem.append($from).append("-").append($to);
            }
        }

        if (this.description.alertable)
            $elem.addClass("alertable");

        if (addTooltip) {
            let $tooltip = $("<div>", { "class": "tooltip" });
            if (this.convention !== null) {
                $("<div>", { "class": "convention-name" })
                    .html(replaceSuitSymbols(this.convention))
                    .appendTo($tooltip);
            }
            // Add HCP range
            let $hcpRange = $("<div>", { "class": "hcprange" });
            let [minHCP, maxHCP] = [this.resolveMinHCP(), this.resolveMaxHCP()];
            if (minHCP === 0) {
                if (maxHCP !== 37)
                    $hcpRange.html(`&le;${maxHCP} HCP`).appendTo($tooltip);
            }
            else {
                if (maxHCP === 37)
                    $hcpRange.html(`&ge;${minHCP} HCP`).appendTo($tooltip);
                else if (minHCP === maxHCP)
                    $hcpRange.html(`${minHCP} HCP`).appendTo($tooltip);
                else
                    $hcpRange.html(`${minHCP}-${maxHCP} HCP`).appendTo($tooltip);
            }
            // Add description
            if (this.description.text !== "") {
                $("<div>", { "class": "description" })
                    .html(replaceSuitSymbols(this.description.text))
                    .appendTo($tooltip);
            }
            else {
                $("<div>", { "class": "description" })
                    .html("<i>No description</i>")
                    .appendTo($tooltip);
            }

            $elem.append($tooltip);
        }

        return $elem;
    }
}


/***********************
* Comparison Functions *
***********************/

function compareDenom(a, b) {
    let idxA = denoms.indexOf(a);
    let idxB = denoms.indexOf(b);

    if (idxA === idxB)
        return 0;
    return idxA < idxB ? -1 : 1;
}

function compareDenomAndLevel(a, b) {
    if (a.level < b.level) 
        return -1;
    else if (a.level === b.level) 
        return compareDenom(a.denom, b.denom);
    else 
        return 1;
}


/**********************
* Auxiliary Functions *
**********************/

function arrayContainsBid(array, name) {
    for (const bid of array) {
        if (typeof bid.name !== typeof name)
            continue;
        if (typeof bid.name === "string")
            if (bid.name === name)
                return true;
        else {
            if (typeof name === "string")
                continue;
            if (bid.name.hasOwnProperty("denom")) {
                if (bid.name.denom === name.denom && bid.name.level == name.level)
                    return true;
            }
            else {
                if (compareDenomAndLevel(bid.from.name, name) <= 0 &&
                    compareDenomAndLevel(bid.to.name, name) >= 0)
                    return true;
            }
        }
    }
    return true;
}

function bidNameFromElem(bid) {
    if (bid.hasAttribute("data-denom")) {
        return {
            "denom": bid.getAttribute("data-denom"),
            "level": parseInt(bid.getAttribute("data-level"))
        };
    }
    else if (bid.hasAttribute("data-name")) {
        return bid.getAttribute("data-name");
    }
    else {
        return null;
    }
}

function escapeSuits(str) {
    return str
        .replace(/\!c/g, "♣")
        .replace(/\!d/g, "♦")
        .replace(/\!h/g, "♥")
        .replace(/\!s/g, "♠");
}
