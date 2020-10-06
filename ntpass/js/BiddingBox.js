class BiddingBox {
	constructor() {
		this.$parent = $("#bidding-box");
		this.$bids = this.$parent.children();
		this.$selectedBid = null;

		this.$bids.filter("[data-denom]")
			.prop("disabled", false)
			.mousedown(this.onMouseDown.bind(this))
			.mouseover(this.onMouseOver.bind(this))
			.mouseup(this.onMouseUp.bind(this));
		this.$bids.filter("[data-name]")
			.prop("disabled", false)
			.click(this.onBid.bind(this))

		// Add global mouseup event in case user exits the 
		// bidding box
		$("body").mouseup(() => {
			this.$selectedBid = null;
			this.$bids.removeClass("selected");
		})
	}

	onMouseDown(event) {
		let $target = $(event.target);
		this.$selectedBid = $target.addClass("selected");
	}

	onMouseOver(event) {
		if (this.$selectedBid === null)
			return;
		let $target = $(event.target);
		this.$bids.removeClass("selected");
		// Hovered bid comes before first bid
		if ($target.prevAll(this.$selectedBid).length === 0)
			return;
		this.$selectedBid
			.addClass("selected")
			.nextUntil($target)
			.addClass("selected");
	}

	onMouseUp(event) {
		let target = event.target;
		if (this.$selectedBid === null)
			return;
		this.$bids.removeClass("selected");
		let startName = bidNameFromElem(this.$selectedBid.get(0));
		let endName = bidNameFromElem(target);
		this.$selectedBid = null;

		let cmp = compareDenomAndLevel(startName, endName);
		if (cmp === 0)
			this.onBid(startName)
		else if (cmp < 0)
			this.onBid({ "from": startName, "to": endName });
	}

	onBid(name) {
		if (name.hasOwnProperty("target"))
			name = name.target.getAttribute("data-name");

		if (name === "up") {
			auction.bids.pop();
			update();
		}
		else if (name === "custom") {
			let modal = new Modal("Name of custom bid");
			let $input = $("<input>", { "type": "text"});
			let $submit = $("<button>", { "html": "Add" });
			$submit.click(function () {
				let bid = new Bid($input.val(), auction.last);
				if (auction.last === null)
					system.openings.push(bid);
				modal.close();
				update();
			});
			$input.keyup(function (event) {
				if (event.keyCode === 13)
					$submit.click();
			});
			modal.append($input).append($submit);
			$input.focus();
			modal.open();

		}
		else if (name === "convention") {
			let modal = new Modal("Choose convention");
			let $ul = $("<ul>", { "class": "select" });
			for (const convention in system.conventions) {
				let $li = $("<li>", { "html": convention });
				$li.click(function () {
					if (auction.length === 0)
						system.openings.push(system.conventions[convention]);
					else
						auction.last.children.push(system.conventions[convention]);
					modal.close();
					update();
				});
				$ul.append($li);
			}
			modal.append($ul);
			modal.open();
		}
		else {
			let bid = new Bid(name, auction.last);
			if (auction.last === null)
				system.openings.push(bid);
			update();
		}
	}

	update() {
		if (auction.mode === Mode.Conventions && auction.length === 0) {
			this.$bids.prop("disabled", true);
		}
		// Set all bids to enabled by default    
		this.$bids.prop("disabled", false);
		// Disable all bids up to the current level of the auction
		let currentLevel = auction.currentLevel;
		this.$bids.filter(function () {
			let name = bidNameFromElem(this);
			if (typeof name !== "object")
				return false;
			return compareDenomAndLevel(currentLevel, name) >= 0;
		}).prop("disabled", true);
		// Disable all bids which are already in the current bid's children
		let alreadyBid = system.openings;
		if (auction.last !== null)
			alreadyBid = auction.last.children;
		for (const bid of alreadyBid) {
			if (typeof bid.name === "string")
				continue;
			if (bid.name.hasOwnProperty("denom")) {
				this.$bids
					.filter(`[data-denom="${bid.name.denom}"][data-level="${bid.name.level}"]`)
					.prop("disabled", true);
			}
			else {
				this.$bids.filter(function () {
					let name = bidNameFromElem(this);
					if (typeof name !== "object")
						return false;
					return compareDenomAndLevel(bid.name.from, name) <= 0 && compareDenomAndLevel(bid.name.to, name) >= 0;
				}).prop("disabled", true);
			}
		}
		// Disable "up" button if auction is empty
		this.$bids.filter(`[data-name="up"]`).prop("disabled", auction.length === 0);
		// Disable "convention" button if there are no conventions
		this.$bids.filter(`[data-name="convention"]`).prop("disabled", Object.keys(system.conventions).length === 0);
	}
}

