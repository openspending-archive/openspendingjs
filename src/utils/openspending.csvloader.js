/*! openspending.csvloader.js - CSV load API tools
 * ------------------------------------------------------------------------
 *
 * Copyright 2015 Open Knowledge Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* REQUIREMENTS
 * CSV.js, jQuery
 */

var OpenSpending = OpenSpending || {};

OpenSpending.CSVloader = function() {
  this.get = function(obj) {
    CSV.fetch({
      // fetch CSV url using configuration data
      url: obj.aggregated_csv_url
    }).done(function(dataset) {
      // The variable levels refers to levels of depth when
      // drilling into dataset, assumed to be all columns except
      // the last one.  The variable amount_col_name can be
      // configured to be anything, but will default to "amount";
      // this is used to derive the variable amount_col which is
      // the column to be summed on. The variable currency is
      // being pulled in through config object, but could possibly
      // come from datapackage.json in the future.

      var levels = dataset.fields.slice(0,dataset.fields.length - 1),
          amount_col_name = obj.amount_col_name || "amount",
          amount_col = dataset.fields.indexOf(amount_col_name),
          currency = obj.currency;

      function slugify_id(text)  {
        // https://gist.github.com/mathewbyrne/1280286

        // This takes strings (e.g. department names) and removes
        // spaces, etc. to allow them to serve as a proper ids.
        if (text !== null) {
          return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
        } else {
          return "null_id";
        }
      }

      // Constructor for making new nodes with the required
      // attributes in the tree.
      function Node(level,id,name,amount,currency) {
        this.id = String(id);
        this.name = String(name);
        this.amount = amount;
        this.label = String(name);
        this.level = level;
        this.children = [];
        this.currency = currency;
        // If a node to be added shares an id with a previously
        // added node, this combines the amounts of the two nodes
        // and returns the old node.  Otherwise, this function
        // appends new nodes to the parent node's children array
        this.addchild = function (node) {
          for (var i in this.children) {
            var child = this.children[i];
            if (child.id === node.id) {
              // found existing id, so add new amount to existing
              // amount
              child.amount += node.amount;
              return child;
            }
          }
          // else push new node
          this.children.push(node);
          return node;
        };
      }

      // Constructs the main tree that will be populated with data
      // from the CSV.
      var tree = new Node(0,"root","root",0,currency);

      // For each row of the CSV, recursively construct the nodes
      // specified by the current row.  We do this by working
      // through the levels, left to right. The i+1 column gets
      // added to the children array of the current column node.
      dataset.records.forEach(function(row) {
        var maker = function(node,ls,i) {
          if (i === (levels.length)) {
            // return 0;
          } else {
            maker(node.addchild(new Node(i+1,slugify_id(row[i]),row[i],Number(row[amount_col]),currency)),levels,i+1);
          }
          // Sum on top-level amounts.  This can probably be
          // factored out somehow.
          if (i === 0) {
            tree.amount += Number(row[amount_col]);
          }
        };

        // Kick off the recursive function.
        maker(tree,levels,0);
      });

      // Make the treemap using the generated tree.
      obj.callback(tree);
    });

    return {};
  };
};
