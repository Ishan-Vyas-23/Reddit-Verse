class BSTNode {
  constructor(post) {
    this.post = post;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(post) {
    const node = new BSTNode(post);
    if (!this.root) {
      this.root = node;
      return;
    }
    let curr = this.root;
    while (true) {
      if (post.upvotes <= curr.post.upvotes) {
        if (!curr.left) {
          curr.left = node;
          break;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = node;
          break;
        }
        curr = curr.right;
      }
    }
  }

  inorder(node = this.root, result = []) {
    if (!node) return result;
    this.inorder(node.left, result);
    result.push(node.post);
    this.inorder(node.right, result);
    return result;
  }

  rangeSearch(min, max) {
    const result = [];
    this._rangeHelper(this.root, min, max, result);
    return result;
  }

  _rangeHelper(node, min, max, result) {
    if (!node) return;

    if (node.post.upvotes > min) this._rangeHelper(node.left, min, max, result);

    if (node.post.upvotes >= min && node.post.upvotes <= max)
      result.push(node.post);
    if (node.post.upvotes < max)
      this._rangeHelper(node.right, min, max, result);
  }

  getMin() {
    if (!this.root) return null;
    let curr = this.root;
    while (curr.left) curr = curr.left;
    return curr.post;
  }

  getMax() {
    if (!this.root) return null;
    let curr = this.root;
    while (curr.right) curr = curr.right;
    return curr.post;
  }

  clear() {
    this.root = null;
  }
}

module.exports = BST;
