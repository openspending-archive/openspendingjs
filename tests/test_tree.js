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
						children: []
					}
				]
			},
			{
				id: 'c2',
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
