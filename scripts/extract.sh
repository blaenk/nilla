#!/usr/bin/env bash

# $1 = get_directory
# $2 = d.get_name

downloads_dir="$1"
target="$downloads_dir/$2"

# ensure downloads_dir is under home and target under downloads_dir

if [[ $downloads_dir != "$HOME/"[!/]* ]]; then
  exit
fi

if [[ $target != "$downloads_dir/"[!/]* ]]; then
  exit
fi

# don't extract single files

if [[ -f $target ]]; then
  exit
fi

cd "$target" || exit

touch .extracting

while IFS= read -r -d '' archive
do
  dir_name=$(basename "${archive%.*}")
  7z x "$archive" "-oextract/$dir_name" -y
done < <(find .
         -name '*.rar'
           -a \! \( -name '*.part??.rar' -a \! -name '*.part01.rar' \)
           -a \! \( -name '*.part?.rar' -a \! -name '*.part1.rar' \)
         -o -name '*.7z'
         -o -name '*.zip'
         -o -name '*.001'
         -print0)

rm .extracting
