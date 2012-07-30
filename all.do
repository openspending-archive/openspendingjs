for f in $(./libfiles .js); do
  if [ $(echo "$f" | grep -c .min.js$) -eq 0 ]; then
    echo ${f%.*}.min.js  
  fi
done |
xargs redo-ifchange
