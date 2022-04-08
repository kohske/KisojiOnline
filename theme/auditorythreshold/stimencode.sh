echo "let sounds = {};" > sounds.js
for f in sound/*.mp3; do
    out=$(echo "sounds['$(basename $f .mp3)']=""\"data:audio/wav;base64,")$(base64 $f)"\";"
    echo $out >> sounds.js
done


