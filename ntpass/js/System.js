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
		// Typecast plain objects to Bid objects
		let reviver = (key, value) => {
			if (typeof value === "object" && value !== null && value["description"] !== undefined)
				return Object.assign(new Bid, value);
			return value;			
		}
		
		let obj = JSON.parse(s, reviver);
		this.info = obj.info;
		this.openings = obj.openings;
		this.conventions = obj.conventions;
		
		update();
		updateHeader();
	}

	serialize() {
		return JSON.stringify(this);
	}
}