let denoms = ["clubs", "diams", "hearts", "spades", "nt"];
let levels = [1, 2, 3, 4, 5, 6, 7];

class Bid {
    constructor(name, parent = null, opts = {}) {
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.name = name;
        this.convention = null;
        this.description = {
            "text": "",
            "alertable": false,
            "minHCP": null,
            "maxHCP": null
        };
        this.children = [];
        this.parent = parent;
        if (parent !== null) {
            parent.children.push(this);
        }

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

    getMinHCP() {
        let cur = this;
        let depth = 0;
        while (cur) {
            if (depth % 4 === 0 && cur.description.minHCP !== null)
                return cur.description.minHCP;
            cur = cur.parent;
            ++depth;
        }
        return 0;
    }

    getMaxHCP() {
        let cur = this;
        let depth = 0;
        while (cur) {
            if (depth % 4 === 0 && cur.description.maxHCP !== null)
                return cur.description.maxHCP;
            cur = cur.parent;
            ++depth;
        }
        return 37;
    }

    draw(addTooltip = false, $elem = null) {
        if ($elem === null)
            $elem = $("<div>", { "class": "bid" });
        else
            $elem.removeClass().html("").css("fontSize", "").addClass("bid");

        if (typeof this.name === "string") {
            if (this.name.match(/^(pass|double|redouble)$/)) {
                $elem.addClass("bid-" + this.name)
            }
            else {
                $elem.addClass("bid-custom");
                $elem.html(this.name);
            }
        }
        else {
            if (this.name.hasOwnProperty("denom")) {
                $elem.addClass(`bid-${this.name.denom} bid-level${this.name.level}`);
            }
            else {
                let $from = $("<span>", { "class": `bid bid-multi bid-${this.name.from.denom} bid-level${this.name.from.level}` });
                let $to = $("<span>", { "class": `bid bid-multi bid-${this.name.to.denom} bid-level${this.name.to.level}` });
                $elem.append($from).append("-").append($to);
            }
        }

        if (this.description.alertable)
            $elem.addClass("alertable");

        if (addTooltip) {
            let $tooltip = $("<div>", { "class": "tooltip" });
            if (this.convention !== null) {
                $("<div>", { "class": "convention-name" })
                    .html(this.convention)
                    .appendTo($tooltip);
            }
            // Add HCP range
            let $hcpRange = $("<div>", { "class": "hcprange" });
            let [minHCP, maxHCP] = [this.getMinHCP(), this.getMaxHCP()];
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
                    .html(this.description.text)
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
