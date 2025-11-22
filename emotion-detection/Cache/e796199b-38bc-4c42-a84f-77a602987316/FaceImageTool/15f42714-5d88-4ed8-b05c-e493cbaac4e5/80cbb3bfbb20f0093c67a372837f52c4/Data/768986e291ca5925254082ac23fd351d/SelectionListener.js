"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionListener = void 0;
class SelectionListener {
    constructor(script) {
        this.script = script;
        this.selectedObjects = {};
        this.onSelectionUpdate = () => { };
        this.onSelectionUpdateCallback = [];
        //@ts-ignore
        if (typeof Editor !== 'undefined') {
            //@ts-ignore
            this.connection = Editor.context.selection.onSelectionChange.connect(() => {
                this.onSelectionChanged();
            });
            this.updateEvent = this.script.createEvent("UpdateEvent");
            this.updateEvent.bind(() => {
                this.onSelectionChanged();
                this.updateEvent.enabled = false;
            });
        }
    }
    onSelectionChanged() {
        //@ts-ignore
        const currentSelection = Editor.context.selection;
        if (currentSelection.sceneObjects.length == 0) {
            return;
        }
        this.selectedObjects = {};
        //@ts-ignore
        Editor.context.selection.sceneObjects.forEach((object) => {
            this.selectedObjects[object.id.toString()] = object;
        });
        this.onSelectionUpdate();
    }
    getSelectedObjects() {
        return this.selectedObjects;
    }
    setOnSelectionUpdate(cb) {
        this.onSelectionUpdate = cb;
    }
    //@ts-ignore
    addSelectedObject(newObject) {
        //@ts-ignore
        let curSelectedObjects = Editor.context.selection.sceneObjects;
        curSelectedObjects.push(newObject);
        //@ts-ignore
        Editor.context.selection.set(curSelectedObjects);
    }
    //@ts-ignore
    setNewSelectedObject(newObject) {
        //@ts-ignore
        Editor.context.selection.set([newObject]);
    }
    clearSelection() {
        this.selectedObjects = {};
        //@ts-ignore
        Editor.context.selection.set([]);
        this.onSelectionUpdate();
    }
}
exports.SelectionListener = SelectionListener;
//# sourceMappingURL=SelectionListener.js.map