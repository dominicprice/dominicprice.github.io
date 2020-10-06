class Modal {
    constructor(title, content) {
        this.dom = {}
        this.dom.$modal = $("<div>", { "class": "modal" });
        this.dom.$box = $("<div>", { "class": "box" }).appendTo(this.dom.$modal);
        this.dom.$header = $("<div>", { "class": "header" }).appendTo(this.dom.$box);
        this.dom.$title = $("<div>", { "class": "title" }).appendTo(this.dom.$header);
        this.dom.$close = $("<div>", { "class": "close" }).appendTo(this.dom.$header);
        this.dom.$main = $("<div>", { "class": "main" }).appendTo(this.dom.$box);

        this.dom.$close.click(() => { this.close(); });
        this.dom.$title.html(title);
    }

    open() {
        tree.unlistenKeyboardEvents();
        $("body").append(this.dom.$modal).css("position", "fixed");
        return this;
    }

    close(callback = function () { return null; }) {
        tree.listenKeyboardEvents();
        this.dom.$modal.remove();
        this.dom = null;
        $("body").css("position", "")
        return callback();
    }

    append(...contents) {
        this.dom.$main.append(contents);
        return this;
    }

    clear() {
        this.dom.$main.empty();
        return this;
	}

    title(contents) {
        return this.dom.$title.html(contents);
    }
}
