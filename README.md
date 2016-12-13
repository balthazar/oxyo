## oxyo [![test](https://img.shields.io/travis/Apercu/oxyo.svg?maxAge=2592000&style=flat-square)](https://travis-ci.org/Apercu/oxyo)
> oxyopia **\ˌäksēˈōpēə\** — Unusual acuteness of sight

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

###### Example

    oxyo -c newyork.png -s secretfile.txt -o encoded.png

Will produce an `encoded.png` image that will look like `newyork.png` when opened, but contains the `secretfile.txt` data.
The secret can be anything.

To decode it, simply pass the `encoded.png` file as the carry, and provide a filename without extension as the output.

    oxyo -c encoded.png -o output

###### Spec

|    1 bit    |  6 bytes  | 8 bytes | n bytes |
|:-----------:|:---------:|:-------:|:-------:|
| hasPassword | extension |  length |   data  |
