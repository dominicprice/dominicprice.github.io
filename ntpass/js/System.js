class System {
	constructor(s) {
		this.info = {
			"name": "",
			"partnerA": "",
			"partnerB": "",
			"overview": ""
		};
		this.openings = [new Bid("Skip", null)];
		this.conventions = {};
	}

	getConvention(name) {
		for (const convention of this.conventions) {
			if (this.conventions[convention].name === name)
				return this.conventions[convention];
		}
		return null;
	}

	load(s) {
		let obj = JSON.parse(s, (key, value) => {
			if (typeof value === "object" && value !== null && value["description"] !== undefined)
				return Object.assign(new Bid, value);
			return value;
		});

		this.info = obj.info;
		this.openings = obj.openings;
		this.conventions = obj.conventions;
	}

	serialize() {
		function replacer(key, value) {
			// Remove all references to parent to remove circular references
			//if (key === "parent")
			//	return undefined;
			// Replace all references to conventions with the convention name
			// if (key === "children" || key === "openings") {
				// let saneChildren = []
				// for (let i = 0; i < value.length; ++i)
					// saneChildren.push(value[i].convention === null ? value[i] : value[i].convention);
				// return saneChildren;
			// }
			return value;
		}
		return JSON.stringify(this, replacer);
	}
}