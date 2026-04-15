for f in */index.md;
do
    echo $f
    if [ -e $f ]; 
    then 
        pandoc $(dirname $f)/index.md -f gfm+raw_html -t html5 -s -c ../common/main.css -o $(dirname $f)/index.html --template=common/template.html --standalone
    fi
done

pandoc index.md -f gfm+raw_html -t html5 -s -c common/main.css -o index.html --template=common/template.html --standalone
