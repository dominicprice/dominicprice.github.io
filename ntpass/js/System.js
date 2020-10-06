class System {
	constructor(s) {
		console.log("Loading system", s);
		this.info = {
			"name": "",
			"partnerA": "",
			"partnerB": "",
			"overview": ""
		};
		this.openings = [new Bid("Skip", null)];
		this.conventions = {};

		if (s) {
			function makeRecursive(o, par) {
				if (typeof o === "string") {
					return this.conventions[o];
				}
				else {
					let bid = new Bid(o.name, par, { "description": o.description, "convention": o.convention });
					for (const child of o.children)
						makeRecursive.bind(this)(child, bid);
					return bid;
				}
			}

			let obj = JSON.parse(s);
			this.info = obj.info;
			this.openings = [];
			for (const c in obj.conventions)
				this.conventions[c] = makeRecursive.bind(this)(obj.conventions[c], null);
			for (const x of obj.openings) 
				this.openings.push(makeRecursive.bind(this)(x, null));
		}
	}

	getConvention(name) {
		for (const convention of this.conventions) {
			if (this.conventions[convention].name === name)
				return this.conventions[convention];
		}
		return null;
	}

	serialize() {
		function replacer(key, value) {
			// Remove all references to parent to remove circular references
			if (key === "parent")
				return undefined;
			// Replace all references to conventions with the convention name
			if (key === "children" || key === "openings") {
				let saneChildren = []
				for (let i = 0; i < value.length; ++i)
					saneChildren.push(value[i].convention === null ? value[i] : value[i].convention);
				return saneChildren;
			}
			return value;
		}
		return JSON.stringify(this, replacer);
	}
}