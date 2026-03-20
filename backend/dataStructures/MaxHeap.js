class MaxHeap {
  constructor() {
    this.heap = [];
  }

  insert(post) {
    this.heap.push(post);
    this._bubbleUp(this.heap.length - 1);
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].upvotes < this.heap[i].upvotes) {
        [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
        i = parent;
      } else {
        break;
      }
    }
  }

  extractMax() {
    if (!this.heap.length) return null;
    const max = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return max;
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].upvotes > this.heap[largest].upvotes)
        largest = left;
      if (right < n && this.heap[right].upvotes > this.heap[largest].upvotes)
        largest = right;
      if (largest !== i) {
        [this.heap[largest], this.heap[i]] = [this.heap[i], this.heap[largest]];
        i = largest;
      } else {
        break;
      }
    }
  }

  getTop(k) {
    const clone = new MaxHeap();
    clone.heap = [...this.heap];
    const result = [];
    for (let i = 0; i < k && clone.heap.length > 0; i++) {
      result.push(clone.extractMax());
    }
    return result;
  }

  clear() {
    this.heap = [];
  }

  get size() {
    return this.heap.length;
  }
}

module.exports = MaxHeap;
