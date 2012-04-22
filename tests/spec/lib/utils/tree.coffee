sampleTree = ->
  id: 'root'
  name: 'root'
  data: {}
  children: [
    {
      id: 'c1'
      name: 'c1'
      children: [
        {
          id: 'c1c1'
          value: 10
          children: []
        }
      ]
    }
    {
      id: 'c2'
      value: 20
      children: []
    }
  ]


describe 'lib/utils/tree', ->
  tree = null

  beforeEach ->
    tree = sampleTree()

  describe 'TreeUtil.prune(tree, n)', ->
    it 'should prune the tree to depth "n"', ->
      expect(tree.children[0].children).to.not.be.empty
      TreeUtil.prune(tree, 1)
      expect(tree.children[0].children).to.be.empty

  describe 'TreeUtil.getSubtree(tree, id)', ->
    it 'should return the subtree starting at the node with id "id"', ->
      subtree = TreeUtil.getSubtree(tree, 'c2')
      expect(subtree.id).to.equal('c2');
      expect(subtree.children).to.be.empty

  describe 'TreeUtil.addNodeWithAncestors(tree, path, node)', ->
    it 'should add the node "node" at the path "path", creating necessary ancestors', ->
      TreeUtil.addNodeWithAncestors(tree, ['c2', 'c2c1', 'c2c1c1'], name: 'Testing')
      expect(tree.children[1].children[0].children[0].id).to.equal('c2c1c1')

  describe 'TreeUtil.calculateValues(tree)', ->
    it 'should calculate the values of each node of the tree on the basis of leaf node values', ->
      TreeUtil.calculateValues(tree)
      expect(tree.value).to.equal(30)
      expect(tree.children[0].value).to.equal(10)

  describe 'TreeUtil.getDepth(tree, nodeId)', ->
    it 'should calculate the depth of the node with id "nodeId" in the tree "tree"', ->
      expect(TreeUtil.getDepth(tree, 'root')).to.equal(0)
      expect(TreeUtil.getDepth(tree, 'c2')).to.equal(1)
      expect(TreeUtil.getDepth(tree, 'c1c1')).to.equal(2)
