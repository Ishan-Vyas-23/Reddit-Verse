const LinkedList = require("../dataStructures/LinkedList");
const MaxHeap = require("../dataStructures/MaxHeap");
const BST = require("../dataStructures/BST");
const HashMap = require("../dataStructures/HashMap");

const postList = new LinkedList();
const postHeap = new MaxHeap();
const postBST = new BST();
const postMap = new HashMap();

function storePosts(posts) {
  postList.clear();
  postHeap.clear();
  postBST.clear();
  postMap.clear();

  for (const post of posts) {
    postList.append(post);
    postHeap.insert(post);
    postBST.insert(post);
    postMap.set(post.id, post);
  }
}

module.exports = { postList, postHeap, postBST, postMap, storePosts };
