class TreeView {
    constructor() {
        this.$parent = $("#treeview");
        this.$modeParent = $("#treeview-mode");
        this.$mainParent = $("#treeview-main");

        $("#mode-openings").click((event) => {
            let $target = $(event.target)
            auction.mode = Mode.Openings;
            auction.bids = [];
            auction.convention = null;
            this.$modeParent.children().removeClass("active");
            $target.addClass("active");
            update();
        });
        $("#mode-conventions").click((event) => {
            let $target = $(event.target);
            auction.mode = Mode.Conventions;
            auction.bids = [];
            auction.convention = null;
            this.$modeParent.children().removeClass("active");
            $target.addClass("active");
            update();
        });

        this.listenKeyboardEvents();
    }

    listenKeyboardEvents() {
        $(document).keyup(function (event) {
            switch (event.which) {
                case 37: // Arrow left
                    auction.pop();
                    update();
                    break;
                case 38: // Arrow up
                    if (auction.length === 1) {
                        let pos = system.openings.indexOf(auction.get(0));
                        if (pos > 0) {
                            auction.pop();
                            auction.push(system.openings[pos - 1]);
                            update();
                        }
                    }
                    else if (auction.length > 1) {
                        let pos = auction.get(auction.length - 2).children.indexOf(auction.last);
                        if (pos > 0) {
                            auction.pop();
                            auction.push(auction.last.children[pos - 1]);
                            update();
                        }
                    }
                    break;
                case 39: // Arrow right
                    if (auction.last === null) {
                        auction.push(system.openings[0]);
                        update();
                    }
                    else {
                        if (auction.last.children.length > 0) {
                            auction.push(auction.last.children[0]);
                            update();
                        }
                    }
                    break;
                case 40: // Arrow down
                    if (auction.length === 1) {
                        let pos = system.openings.indexOf(auction.get(0));
                        if (pos < system.openings.length - 1) {
                            auction.pop();
                            auction.push(system.openings[pos + 1]);
                            update();
                        }
                    }
                    else if (auction.length > 1) {
                        let pos = auction.get(auction.length - 2).children.indexOf(auction.last);
                        if (pos < auction.get(auction.length - 2).children.length - 1) {
                            auction.pop();
                            auction.push(auction.last.children[pos + 1]);
                            update();
                        }
                    }
                    break;
                case 33: // Page up
                    info.onMoveUp();
                    break;
                case 34: // Page down
                    info.onMoveDown();
                    break;
                case 46: // Delete
                    if (auction.length > 0 && auction.last.name !== "Skip")
                        info.onDelete();
                    break;
                default:
                    break;
            }
            return false;
        });
    }

    unlistenKeyboardEvents() {
        $(document).off("keyup");
	}

    addColumn() {
        let $col = $("<div>", { "class": "column" });
        $col.appendTo(this.$mainParent);
        return $col;
    }

    addBid(bid, $col, isActive) {
        let $bid = bid.draw(bid.name !== "Skip", $("<button>"));
        $bid.addClass("selectable");
        if (isActive)
            $bid.addClass("active");
        $bid.click(() => { this.onClickBid(bid) });
        $col.append($bid);
        return $bid;
    }

    addConvention(convention, $col, isActive) {
        let $convention = $("<li>", { "class": "convention selectable" });
        $convention.append($("<div>", { "class": "name", "html": convention }));
        $convention.append(system.conventions[convention].draw());
        if (isActive)
            $convention.addClass("active");
        $col.append($convention);
        $convention.click(() => { this.onClickBid(system.conventions[convention]) });
        return $convention;
    }

    onClickBid(bid) {
        if (system.openings.indexOf(bid) !== -1) {
            auction.clear();
        }
        else {
            for (let i = 0; i < auction.length - 1; ++i) {
                if (auction.get(i).children.indexOf(bid) !== -1) {
                    auction.eraseFrom(i + 1);
                    break;
                }
            }
        }
        auction.push(bid);
        update();
    }

    onClickConvention(convention) {
        auction.clear();
        auction.convention = convention;
        auction.push(system.conventions[convention]);
        update();
    }

    update() {
        this.$mainParent.empty();
        if (auction.mode === Mode.Openings) {
            let $col = this.addColumn();
            for (const bid of system.openings)
                this.addBid(bid, $col, bid === auction.get(0));
        }
        else {
            let $col = this.addColumn();
            $col.addClass("conventions");
            for (const convention in system.conventions) {
                this.addConvention(convention, $col, auction.bids[0] === system.conventions[convention]);
			}
        }

        for (let i = 0; i < auction.length; ++i) {
            let $col = this.addColumn();
            if (i % 2 === 0)
                $col.addClass("opps");
            let children = auction.get(i).children;
            if (children.length === 0) {
                $col.append("<div>", { "class": "bid bid-empty" });
            }
            else if (children.length === 1 && children[0].name === "pass") {
                $col.removeClass("opps");
                $col.addClass("bid bid-pass selectable");
                if (auction.get(i).description.alertable)
                    $col.addClass("alertable");
                if (auction.get(i + 1) === children[0])
                    $col.addClass("active");
                $col.click(() => { this.onClickBid(children[0]) });
            }
            else for (const child of children) {
                this.addBid(child, $col, child === auction.get(i + 1));
            }
        } 
    }
}