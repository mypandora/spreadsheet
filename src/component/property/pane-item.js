import Item from './item';

/**
 * @ignore
 * @class
 * @extends Item
 */
class PaneItem extends Item {
  pane() {}

  element() {
    const { tag } = this;
    this.pane = this.pane();
    this.pane.change = (it) => this.change(tag, it);
    return super.element().child(this.pane);
  }

  setState(state) {
    if (state) {
      this.pane?.setContent(state);
    } else {
      this.pane.hide();
    }
  }
}

export default PaneItem;
