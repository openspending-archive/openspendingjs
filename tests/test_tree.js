module('tree');

function sampleTree() {
  var sampleTree = {
    id: 'root',
    name: 'root',
    data: {},
    children: [
      {
        id: 'c1',
        name: 'c1',
        children: [
          {
            id: 'c1c1',
            value: 10,
            children: []
          }
        ]
      },
      {
        id: 'c2',
        value: 20,
        children: []
      }
    ]
  };
  return sampleTree;
}

test('prune', function() {
  var ourtree = sampleTree();
  equals(ourtree.children[0].children.length, 1, 'tree should have max depth 2');

  TreeUtil.prune(ourtree, 1);
  equals(ourtree.children[0].children.length, 0, 'tree should have max depth 1');
});

test('getSubtree', function() {
  var ourtree = sampleTree();
  var subtree = TreeUtil.getSubtree(ourtree, 'c2');
  equals(subtree.id, 'c2');
  equals(subtree.children.length, 0);
});

test('addNodeWithAncestors', function() {
  var ourtree = sampleTree();
  TreeUtil.addNodeWithAncestors(ourtree, ['c2', 'c2c1', 'c2c1c1'], {'name': 'Testing'});
  equals(ourtree.children[1].children[0].children[0].id, 'c2c1c1', 'tree should have extra nodes');
});

test('calculateValues', function() {
  var ourtree = sampleTree();
  TreeUtil.calculateValues(ourtree);
  equals(ourtree.value, 30);
  equals(ourtree.children[0].value, 10);
});

test('getDepth', function() {
  var ourtree = sampleTree();
  var out = TreeUtil.getDepth(ourtree, 'root');
  equals(out, 0);
  var out = TreeUtil.getDepth(ourtree, 'c2');
  equals(out, 1);
  var out = TreeUtil.getDepth(ourtree, 'c1c1');
  equals(out, 2);
});

