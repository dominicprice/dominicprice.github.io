class InfoView {
	constructor() {
		this.$systemname = $("#header-name");
		this.$partnera = $("#header-partnera");
		this.$partnerb = $("#header-partnerb");
		this.$overview = $("#header-overview");

		this.$systemname
			.prop("disabled", false)
			.val(system.info.name)
			.focusout(() => { system.info.name = this.$systemname.val(); });
		this.$partnera
			.prop("disabled", false)
			.val(system.info.partnerA)
			.focusout(() => { system.info.partnerA = this.$partnera.val(); });
		this.$partnerb
			.prop("disabled", false)
			.val(system.info.partnerB)
			.focusout(() => { system.info.partnerB = this.$partnerb.val(); });
		this.$overview
			.prop("disabled", false)
			.val(system.info.overview)
			.focusout(() => { system.info.overview = this.$overview.val(); });

		this.$bid = $("#curbid-name .bid");
		this.$seat = $("#curbid-name .seat");
		this.$alertable = $("#curbid-alertable");
		this.$minHCP = $("#curbid-minhcp");
		this.$maxHCP = $("#curbid-maxhcp");
		this.$description = $("#curbid-description");
		this.$moveup = $("#curbid-moveup");
		this.$movedown = $("#curbid-movedown");
		this.$rename = $("#curbid-rename");
		this.$delete = $("#curbid-delete");
		this.$assignConvention = $("#curbid-assign-convention");

		this.$alertable.unbind().change(this.onAlertable.bind(this));
		this.$minHCP.unbind().change(this.onMinHCP.bind(this));
		this.$maxHCP.unbind().change(this.onMaxHCP.bind(this));
		this.$description.unbind().focusout(this.onDescription.bind(this));
		this.$moveup.unbind().click(this.onMoveUp.bind(this));
		this.$movedown.unbind().click(this.onMoveDown.bind(this));
		this.$rename.unbind().click(this.onRename.bind(this));
		this.$delete.unbind().click(this.onDelete.bind(this));
		this.$assignConvention.unbind().click(this.onAssignConvention.bind(this));
	}

	onAlertable() {
		let value = this.$alertable.prop("checked");
		if (value === auction.last.description.alertable)
			return;
		auction.last.description.alertable = value;
		update();
	}

	onMinHCP() {
		let value = this.$minHCP.val();
		if (value === "")
			value = null;
		else
			value = parseInt(value);

		if (auction.last.description.minHCP === value)
			return;
		auction.last.description.minHCP = value;
		update();
	}

	onMaxHCP() {
		let value = this.$maxHCP.val();
		if (value === "")
			value = null;
		else
			value = parseInt(value);

		if (auction.last.description.maxHCP === value)
			return;
		auction.last.description.maxHCP = value;
		update();
	}

	onDescription() {
		let value = this.$description.val();
		if (value === auction.last.description.text)
			return;
		auction.last.description.text = value;
		update();
	}

	onRename() {
		$("body").append(biddingBox.$dimmer);
		biddingBox.renameMode = true;
		biddingBox.$bids.prop("disabled", false);
	}

	onRenameOld() {
		if (auction.mode === Mode.Conventions && auction.length === 1) {
			let modal = new Modal("Rename convention");
			let $name = $("<input>", { "type": "text" });
			let $btn = $("<button>", { "html": "Rename" });
			$btn.click(function () {
				let oldName = auction.convention;
				let newName = $name.val();
				function renameRecursive(bid) {
					if (bid.convention === oldName)
						bid.convention = newName;
					for (const child of bid.children)
						renameRecursive(child);
				}
				for (const opening of system.openings)
					renameRecursive(opening);
				for (const [key, value] of Object.entries(system.conventions)) {
					for (const child of value)
						renameRecursive(child);
				}
				auction.clear();
				system.conventions[newName] = system.conventions[oldName];
				delete system.conventions[oldName];
				modal.close();
				update();
			});
			$name.keyup(function (event) {
				if (event.which === 13)
					$btn.click();
			});
			modal.append($name).append($btn);
			modal.open();
			$name.focus();
		}
		else {
			let modal = new Modal("Rename bid");
			let $name = $("<input>", { "type": "text" });
			let $btn = $("<button>", { "html": "Rename" });
			$btn.click(function () {
				auction.last.name = $name.val();
				modal.close();
				update();
			});
			$name.keyup(function (event) {
				if (event.which === 13)
					$btn.click();
			});
			modal.append($name).append($btn);
			modal.open();
			$name.focus();
		}
	}

	onDelete() {
		if (auction.mode === Mode.Conventions && auction.length === 1)
			this.onDeleteConvention();
		else
			this.onDeleteBid();
	}

	onDeleteConvention() {
		let modal = new Modal("Delete this convention?");
		modal.append($("<div>", { "html": "Are you sure you want to delete this convention? All occurrences in your system will be removed." }));
		let $yes = $("<button>", { "class": "no", "html": "Delete" });
		let $no = $("<button>", { "html": "Cancel" });
		$yes.click(function () {
			let convention = auction.last.convention;
			function deleteRecursive(bid) {
				if (bid.convention === convention) 
					bid.convention = null;
				for (const child of bid.children) {
					deleteRecursive(child);
				}
			}
			delete system.conventions[convention];

			auction.clear();
			modal.close();
			update();
		});
		$no.click(function () {
			modal.close();
		});
		modal.append($yes).append($no).open();
	}

	onDeleteBid() {
		let modal = new Modal("Delete this bid?");
		modal.append($("<div>", { "html": "Are you sure you want to delete this bid and off of its continuations?" }));
		let $yes = $("<button>", { "class": "no", "html": "Delete" });
		let $no = $("<button>", { "html": "Cancel" });
		$yes.click(function () {
			let toDelete = auction.pop();
			if (auction.length === 0) {
				let pos = system.openings.indexOf(toDelete);
				system.openings.splice(pos, 1);
			}
			else {
				let pos = auction.last.getChildren().indexOf(toDelete);
				auction.last.getChildren().splice(pos, 1);
			}
			modal.close();
			update();
		});
		$no.click(function () {
			modal.close();
		});
		modal.append($no).append($yes).open();
		$no.focus();
	}

	onMoveUp() {
		if (auction.bids.length === 0 || auction.mode === Mode.Conventions && auction.bids.length === 1)
			return;
		let l = system.openings;
		if (auction.bids.length > 1)
			l = auction.bids[auction.bids.length - 2].getChildren();
		let pos = l.indexOf(auction.bids[auction.bids.length - 1]);
		if (pos === 0)
			return;
		let tmp = auction.bids[auction.bids.length - 1];
		l[pos] = l[pos - 1];
		l[pos - 1] = tmp;
		update();
	}

	onMoveDown() {
		if (auction.bids.length === 0 || auction.mode === Mode.Conventions && auction.bids.length === 1)
			return;
		let l = system.openings;
		if (auction.bids.length > 1)
			l = auction.bids[auction.bids.length - 2].getChildren();
		let pos = l.indexOf(auction.bids[auction.bids.length - 1]);
		if (pos === l.length - 1)
			return;
		let tmp = auction.bids[auction.bids.length - 1];
		l[pos] = l[pos + 1];
		l[pos + 1] = tmp;
		update();
	}

	onAssignConvention() {
		if (auction.last.convention !== null || auction.last.children.length != 0) {
			let modal;
			if (auction.last.convention !== null)
				modal = new Modal(`This bid already has the convention ${auction.last.convention} assigned to it, continue?`);
			else
				modal = new Modal("This bid already has continuations which will be deleted if you assign a convention to it. Continue?");
			let $no = $("<button>", { "class": "yes", "html": "No" });
			let $yes = $("<button>", { "class": "no", "html": "Yes" });
			$no.click(function () { modal.close(); });
			$yes.click(() => { modal.close(); this.onSelectConvention(); });
			modal.append($no).append($yes).open();
		}
		else {
			this.onSelectConvention();
		}
	}

	onSelectConvention() {
		let modal = new Modal("Choose convention");
		let $ul = $("<ul>", { "class": "select" });
		for (const convention in system.conventions) {
			let $li = $("<li>", { "html": convention });
			$li.click(function () {
				auction.last.convention = convention;
				auction.last.children = [];
				modal.close();
				update();
			});
			$ul.append($li);
		}
		modal.append($ul);
		modal.open();
	}

	update() {
			if (auction.length === 0 || auction.last.name === "Skip") {
				this.$bid
					.removeClass()
					.addClass("bid bid-empty")
					.css("font-size", "")
					.html("");
				this.$seat
					.html("(N)");
				this.$alertable
					.prop("checked", false)
					.prop("disabled", true);
				this.$minHCP
					.val("")
					.prop("disabled", true);
				this.$maxHCP
					.val("")
					.prop("disabled", true);
				this.$description
					.val("")
					.prop("disabled", true);
				this.$moveup
					.prop("disabled", true);
				this.$movedown
					.prop("disabled", true);
				this.$rename
					.prop("disabled", true);
				this.$delete
					.prop("disabled", true);
				this.$assignConvention
					.prop("disabled", true);
			}
			else {
				auction.last.draw(false, this.$bid);
				this.$seat.html("NESW"[(auction.length + 3) % 4]);
				this.$alertable
					.prop("disabled", false)
					.prop("checked", auction.last.description.alertable);
				this.$minHCP
					.prop("disabled", false)
					.val(auction.last.description.minHCP || "");
				this.$maxHCP
					.prop("disabled", false)
					.val(auction.last.description.maxHCP || "");
				this.$description
					.prop("disabled", false)
					.val(auction.last.description.text);
				this.$moveup
					.prop("disabled", false);
				this.$movedown
					.prop("disabled", false);
				this.$rename
					.prop("disabled", false);
				this.$delete
					.prop("disabled", false);
				this.$assignConvention
					.prop("disabled", Object.keys(system.conventions).length === 0 || (Auction.mode === Mode.Conventions && auction.length < 2));
			}
	}
}