for f in $(./libfiles .min.js); do
  if [ -f ${f%.min.js}.js ]; then
    echo $f
  else
    echo "WARNING: $f does not have unminified version, leaving it alone!" 1>&2
  fi
done |
xargs rm

rm -rf t/.redo redo-sh
if [ -e .do_built ]; then
  while read x; do
    [ -d "$x" ] || rm -f "$x"
  done <.do_built
fi
[ -z "$DO_BUILT" ] && rm -rf .do_built .do_built.dir
rm -f *~ .*~ */*~ */.*~ 
find . -name '*.tmp' -exec rm -fv {} \;
