class BiddingBox {
	constructor() {
		this.$parent = $("#bidding-box");
		this.$bids = this.$parent.children();
		this.$selectedBid = null;
		this.renameMode = false;
		this.$dimmer = $("<div>", { "class": "underlay" });;

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
			if (this.renameMode) {
				this.renameMode = false;
				this.$dimmer.remove();
				update();
			}
			else {
				auction.bids.pop();
				update();
			}
		}
		else if (name === "custom") {
			let modal = new Modal("Name of custom bid");
			let $input = $("<input>", { "type": "text"});
			let $submit = $("<button>", { "html": "Add" });
			$submit.click(function () {
				if (this.renameMode) {
					auction.last.name = $input.val();
					this.renameMode = false;
					this.$dimmer.remove();
					update();
				}
				else {
					let bid = new Bid($input.val(), auction.last);
					if (auction.last === null)
						system.openings.push(bid);
					modal.close();
					update();
				}
			});
			$input.keyup(function (event) {
				if (event.keyCode === 13)
					$submit.click();
			});
			modal.append($input).append($submit);
			$input.focus();
			modal.open();
		}
		else if (name === "step") {
			let modal = new Modal("Number of steps");
			let $input = $("<input>", { "type": "number", "min": "0", "max": "35" });
			let $submit = $("<button>", { "html": "Add" });
			$submit.click(function () {
				if (this.renameMode) {
					auction.last.name = parseInt($input.val());
					this.renameMode = false;
					this.$dimmer.remove();
					update();
				}
				else {
					let bid = new Bid(parseInt($input.val()), auction.last);
					if (auction.last === null)
						system.openings.push(bid);
					modal.close();
					update();
				}
			});
			$input.keyup(function (event) {
				if (event.keyCode === 13)
					$submit.click();
			});
			modal.append($input).append($submit);
			$input.focus();
			modal.open();
		}
		else {
			if (this.renameMode) {
				auction.last.name = name;
				this.renameMode = false;
				this.$dimmer.remove();
				update();
			}
			else {
				let bid = new Bid(name, auction.last);
				if (auction.last === null)
					system.openings.push(bid);
				update();
			}
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
			alreadyBid = auction.last.getChildren();
		for (const bid of alreadyBid) {
			let name = bid.resolveName();
			if (typeof name === "string")
				continue;
			if (name.hasOwnProperty("denom")) {
				this.$bids
					.filter(`[data-denom="${name.denom}"][data-level="${name.level}"]`)
					.prop("disabled", true);
			}
			else {
				this.$bids.filter(function () {
					let nameComp = bidNameFromElem(this);
					if (typeof nameComp !== "object")
						return false;
					return compareDenomAndLevel(name.from, nameComp) <= 0 && compareDenomAndLevel(name.to, nameComp) >= 0;
				}).prop("disabled", true);
			}
		}
		// Disable "up" button if auction is empty
		this.$bids.filter(`[data-name="up"]`).prop("disabled", auction.length === 0);
	}
}

