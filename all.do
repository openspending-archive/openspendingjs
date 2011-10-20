for f in $(./libfiles .js); do
  if [[ ! "$f" =~ ".min.js$" ]]; then
    echo ${f%.*}.min.js  
  fi
done |
xargs redo-ifchange
