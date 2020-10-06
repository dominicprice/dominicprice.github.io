class Event {
	constructor(type, what) {
		this.type = type;
		this.what = what;
	}
}

class Canvas {
	constructor(canvasID) {
		this.canvas = document.getElementById(canvasID);
		this.canvas.setAttribute('width', window.getComputedStyle(this.canvas).getPropertyValue("width"));
		this.canvas.setAttribute('height', window.getComputedStyle(this.canvas).getPropertyValue("height"));
		this.context = this.canvas.getContext("2d");
		this.curPath = null;
		this.eventQueue = [];
		
		this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
		this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
		this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
	}

	clear() {
		this.eventQueue = [];
		this.redraw();
	}
	
	undo() {
		for (let i = this.eventQueue.length - 1; i >= 0; --i) {
			if (this.eventQueue.type === "path") {
				this.eventQueue.splice(i, 1);
				break;
			}
		}
	}
	
	changeColour(c) {
		this.eventQueue.push(new Event("colour", c));
	}
	
	changeThickness(w) {
		this.eventQueue.push(new Event("thickness", w));
	}
	
	onMouseDown(e) {
		let x = e.pageX - this.canvas.offsetLeft;
		let y = e.pageY - this.canvas.offsetTop;
		this.curPath = new Path2D();
		this.curPath.moveTo(x, y);
		this.eventQueue.push(new Event("path", this.curPath));
		this.redraw();
	}
	
	onMouseMove(e) {
		if (this.curPath === null)
			return;
		let x = e.pageX - this.canvas.offsetLeft;
		let y = e.pageY - this.canvas.offsetTop;
		this.curPath.lineTo(x, y);
		this.redraw();
	}

	onMouseUp(e) {
		this.curPath = null;
		this.redraw();
	}

	redraw() {
		let context = this.context;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.strokeStyle = "#df4b26";
		context.lineJoin = "round";
		context.lineWidth = 5;

		for (const event in this.eventQueue) {
			switch (event.type) {
				case "path":
					context.beginPath();
					context.stroke(event.what);
				case "colour":
					context.strokeStyle = event.what;
				case "thickness":
					context.lineWidth = event.what;
			}
		}
	}
}

let canvas = null;

function init() {
	canvas = new Canvas("blackboard-canvas");
	document.getElementById("undo").addEventListener("click", () => { canvas.undo(); });
	document.getElementById("clear").addEventListener("click", () => { canvas.clear(); });
	for (const elem of document.getElementsByClassName("thickness"))
		elem.addEventListener("click", () => { canvas.changeThickness(parseInt(elem.getAttribute("data-thickness"))); });
	for (const elem of document.getElementsByClassName("colour")) 
		elem.addEventListener("click", () => { canvas.changeColour(elem.style.backgroundColor); });
}

init();