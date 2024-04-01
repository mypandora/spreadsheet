class History {
  constructor() {
    this.undoItems = [];
    this.redoItems = [];
  }

  add(data) {
    this.undoItems.push(JSON.stringify(data));
    this.redoItems = [];
  }

  canUndo() {
    return this.undoItems.length > 0;
  }

  canRedo() {
    return this.redoItems.length > 0;
  }

  undo(current, cb) {
    const { undoItems, redoItems } = this;
    if (this.canUndo()) {
      redoItems.push(JSON.stringify(current));
      cb(JSON.parse(undoItems.pop()));
    }
  }

  redo(current, cb) {
    const { undoItems, redoItems } = this;
    if (this.canRedo()) {
      undoItems.push(JSON.stringify(current));
      cb(JSON.parse(redoItems.pop()));
    }
  }
}

export default History;
