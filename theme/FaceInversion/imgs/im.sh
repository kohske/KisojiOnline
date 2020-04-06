for f in orig/image*.jpg;
do
    convert -resize 256x256 $f  -type GrayScale use/$(basename $f)
done

for f in orig/p_image*.jpg;
do
    convert -resize 256x256 $f  -type GrayScale use/$(basename $f)
done

for f in orig/i_image*.jpg;
do
    convert -resize 256x256 $f  -type GrayScale -flip use/$(basename $f)
done

for f in orig/i_p_image*.jpg;
do
    convert -resize 256x256 $f  -type GrayScale -flip use/$(basename $f)
done
