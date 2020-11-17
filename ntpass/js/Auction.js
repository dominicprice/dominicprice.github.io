const Mode = Object.freeze({
    Openings: 1,
    Conventions: 2
});

class Auction {
    constructor() {
        this.$parent = $("#auction");
        this.$first = this.$parent.children().slice(4, 5);
        this.bids = [];
        this.mode = Mode.Openings;
        this.convention = null;
    }

    clear() {
        this.bids = [];
    }

    push(bid) {
        this.bids.push(bid);
    }

    pop() {
        return this.bids.pop();
    }

    eraseFrom(idx) {
        if (typeof idx === "number")
            this.bids.splice(idx);
        else
            this.bids.splice(this.bids.indexOf(idx));
    }

    get length() {
        return this.bids.length;
    }

    get(idx) {
        return idx < this.bids.length ? this.bids[idx] : null;
    }

    get last() {
        return this.bids.length === 0 ? null : this.bids[this.bids.length - 1];
    }

    get currentLevel() {
        for (let i = this.bids.length - 1; i >= 0; --i) {
            let name = this.bids[i].resolveName();
            if (typeof name === "string")
                continue;
            if (name.hasOwnProperty("denom"))
                return name;
            else
                return name.to;
        }
        return { "denom": "clubs", "level": 0 };
    }

    update() {
        let self = this;
        function getNext($cur) {
            $cur = $cur.next();
            if ($cur.length > 0)
                return $cur;
            return $("<div>", { "class": "bid" }).appendTo(self.$parent);
        }
        function emptyBox($elem) {
            $elem.removeClass().addClass("bid").html("&nbsp;");
		}

        let $cur = this.$first;
        for (let i = 0; i < this.length; ++i) {
            if (this.get(i).name === "Skip") {
                emptyBox($cur);
                $cur.addClass("bid-skip");
            }
            else {
                this.get(i).draw(true, $cur);
            }
            $cur = getNext($cur);
        }
        if (this.length === 0 || this.length % 4 !== 0) {
            for (let i = this.length % 4; i < 4; ++i) {
                emptyBox($cur);
                $cur.addClass("bid");
                $cur = getNext($cur);
            }
        }
        $cur.nextAll().addBack().remove();
    }
}