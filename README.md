## oxyo [![test](https://img.shields.io/travis/Apercu/oxyo.svg?maxAge=2592000&style=flat-square)](https://travis-ci.org/Apercu/oxyo)
> oxyopia **\ˌäksēˈōpēə\** — Unusual acuteness of sight

![use case](http://i.imgur.com/njXg3Uc.gif)

This utility will allow you to hide and reveal things inside/from images using
the least significant bit method.

    npm i -g oxyo

###### Usage

    oxyo -c <carryFile> -o <outputFile> -s [secretFile] -p [password]

Either encode a secret file into an output file based on the carrier image or
decode a previously encoded file into another.
Not providing a secret file implies that the program will attempt a decode of
the carrier image into the output.
You can also provide a password for increased security.

For encoding, the carry should be either a `jpg` or `png`, and the output needs
to be a `png`.

When decoding, no need to specify the output file extension, it will be automatically added.

###### Spec

|    1 bit    |  6 bytes  | 8 bytes | n bytes |
|:-----------:|:---------:|:-------:|:-------:|
| hasPassword | extension |  length |   data  |
