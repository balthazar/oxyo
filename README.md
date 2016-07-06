## oxyo [![test](https://img.shields.io/travis/Apercu/oxyo.svg?maxAge=2592000&style=flat-square)](https://travis-ci.org/Apercu/oxyo)
> oxyopia **\ˌäksēˈōpēə\** — Unusual acuteness of sight

This utility will allow you to hide and reveal things inside/from images using
the least significant bit method.

    npm i -g oxyo

###### Usage

    oxyo -c <carry> -o <output> -s [secret]

Either encode secret data into an output file based on the carrier image or
decode it from said file into another.
Not providing a secret file implies that the program will attempt a decode of
the carrier image into the output.

For encoding, the carry should be either a `jpg` or `png`, and the output needs
to be a `png`.

###### Troubleshooting

- If you don't have Node 6, you can go to [this link](https://www.youtube.com/watch?v=dQw4w9WgXcQ).
