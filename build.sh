#!/bin/bash 
# 
# This will build all scripts for OpenSpending.
#

echo "Compiling boot script..."
FN='tmp'
echo ''>$FN
cat lib/vendor/yepnope.min.js >>$FN
cat lib/vendor/base64.js >>$FN
cat lib/vendor/accounting.min.js >>$FN
cat lib/vendor/underscore.js >>$FN
cat lib/vendor/handlebars.js >>$FN
cat lib/vendor/bootstrap.js >>$FN
cat lib/boot.js >>$FN
cat lib/utils/utils.js >>$FN
cat lib/aggregator.js >>$FN
uglifyjs -o prod/boot.js $FN
rm $FN

echo "Compiling browser coffee scripts..."
coffee -c -o app/browser/ app/browser/openspending.browser.coffee
coffee -c -o app/data_table/ app/data_table/openspending.data_table.coffee
coffee -c -o app/faceter/ app/faceter/openspending.faceter.coffee


