#!/usr/bin/env bash

# $1 = get_directory
# $2 = d.get_name

downloads_dir=$1
target="$downloads_dir/$2"

# ensure downloads_dir is under home and target under downloads_dir

if [[ $downloads_dir != "$HOME/"[!/]* ]]; then
  exit
fi

if [[ $target != "$downloads_dir/"[!/]* ]]; then
  exit
fi

rm -rfv "$target"
