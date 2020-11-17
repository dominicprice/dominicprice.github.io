/*****************
* Menu callbacks *
*****************/

class Menu {
	constructor() {
		$("#menu-new").click(this.onNew.bind(this));
		$("#menu-open").click(this.onOpen.bind(this));
		$("#menu-open-widget").change(this.doOpen.bind(this));
		$("#menu-save").click(this.onSave.bind(this));
		$("#menu-report-bug").click(this.onReportBug.bind(this));
		$("#menu-help").click(this.onHelp.bind(this));
	}

	onNew() {
		this.confirmDialog(
			"Discard changes?",
			"Are you sure you want to continue and discard any unsaved changes?",
			this.doNew.bind(this)
		);
	}

	doNew() {
		system = new System();
		update();
	}

	onOpen() {
		this.confirmDialog(
			"Discard changes?",
			"Are you sure you want to continue and discard any unsaved changes?",
			() => { $("#menu-open-widget").trigger("click"); }
		);
	}

	doOpen() {
		let files = document.getElementById("menu-open-widget").files;
		if (files.length < 1)
			return;
		let reader = new FileReader();
		reader.addEventListener("loadend", function (e) {
			try {
				system.load(reader.result);
				update();
			}
			catch (err) {
				let $modal = new Modal("Could not open system");
				$modal.append($(`<div>${err}</div>`));
				$modal.open();
			}
		});
		reader.readAsText(files[0]);
	}

	onSave() {
		console.log("Saving");
		let data = system.serialize();
		let blob = new Blob([data], { type: "application/json" });
		let url = URL.createObjectURL(blob);
		let a = document.createElement("a");
		a.href = url;
		a.download = (system.info.name || "system") + ".json";
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			URL.revokeObjectURL(a.href);
			document.body.removeChild(a);
		});
	}

	onReportBug() {

	}

	onHelp() {

	}

	confirmDialog(title, message, onConfirm) {
		let $dialog = new Modal(title);
		let $content = $("<div>", { "html": message });
		let $yes = $("<button>", { "class": "no", "html": "Continue Anyway", "click": () => { $dialog.close(onConfirm); } });
		let $no = $("<button>", { "html": "Cancel", "click": () => { $dialog.close(); } });
		$dialog.append($content).append($no).append($yes);
		$dialog.open();
		$no.focus();
	}
}
