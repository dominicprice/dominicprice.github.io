class Modal {
    constructor(title) {
        this.dom = {}
        this.dom.$modal = $("<div>", { "class": "modal" });
        this.dom.$wrapper = $("<div>", { "class": "content-wrapper" }).appendTo(this.dom.$modal);
        this.dom.$header = $("<header>").appendTo(this.dom.$wrapper);
        this.dom.$title = $("<h2>", { "html": title }).appendTo(this.dom.$header);
        this.dom.$close = $("<button>", { "class": "close" }).appendTo(this.dom.$header);
        this.dom.$buttonBox = null;
        this.dom.$main = $("<main>").appendTo(this.dom.$wrapper);

        this.dom.$close.click(() => { this.close(); });
    }

    open() {
        console.log("Opening!");
        content.unlistenKeyboardEvents();
        $("body").append(this.dom.$modal);
        $("input", this).focus();
        console.log(this.dom);
        return this;
    }

    close(callback = function () { return null; }) {
        content.listenKeyboardEvents();
        this.dom.$modal.remove();
        this.dom = null;
        $("body").css("position", "")
        return callback();
    }

    append(...contents) {
        this.dom.$main.append(contents);
        return this;
    }

    appendText(text) {
        return this.append($("<p>", { "html": text }));
    }

    appendButton(text, colourClass, onClick) {
        if (this.dom.$buttonBox === null) {
            this.dom.$buttonBox = $("<div>", { "class": "button-box" })
            this.dom.$main.append(this.dom.$buttonBox);
        }
        this.dom.$buttonBox.append($("<button>", { "html": text, "class": colourClass, "click": onClick }));
        return this;
    }

    appendInputWithButton(text, colourClass, onClick, inputArgs = {}) {
        let $input = $("<input>");
        let $btn = $("<button>", { "html": text, "class": colourClass });
        $input.keyup(function (event) { if (event.keyCode === 13) $btn.click(); });
        $btn.click(function () { onClick($input.val()); });
        let $inputBox = $("<div>", { "class": "input-box" });
        $inputBox.append($input);
        $inputBox.append($btn);
        return this.append($inputBox);
	}

    clear() {
        this.dom.$main.empty();
        return this;
	}

    title(contents) {
        return this.dom.$title.html(contents);
    }
}
