## oxyo
> oxyopia **\ˌäksēˈōpēə\** — Unusual acuteness of sight

This utility will allow you to hide and reveal things inside/from images using
the least significant bit method.

    npm i -g oxyo

###### Usage

    oxyo -c <carry> -o <output> -s [secret]

Either encode secret data into an output file based on the carrier image or
decode it from said file into another.
Not providing a secret file implies that the program will attempt a decode of
the carrier image into the output

###### Troubleshooting

- If the build is broken due to node-gyp, you can try to add `--unsafe-perm` while installing, [#454](https://github.com/nodejs/node-gyp/issues/454).
- If you don't have Node 6, you can go to [this link](https://www.youtube.com/watch?v=dQw4w9WgXcQ).
