# Contributing

## Add a piece

Use the [submission form](https://github.com/SHARPLEE00/awesome-ai-motion-videos/issues/new?template=submit.yml) or open a pull request that adds one object to `data/videos.json`.

An entry qualifies when:

- it's a public post on X with a video or animation,
- the creator says an AI model made it (mostly in code: three.js, canvas, SVG, Remotion, HyperFrames, game engines driven by the model),
- it isn't already listed.

Fields: `id`, `handle`, `name`, `url` (`https://x.com/<handle>/status/<id>`), `date`, `title`, `titleZh`, `category` (`motion`, `3d`, `interactive`, `comparison`), `models`, `text` (the post, verbatim), `thumb` (X's thumbnail URL), `duration`, and `prompt` + `promptUrl` only when the creator published the exact prompt.

Then run `node scripts/build.mjs`, which checks every entry and regenerates both READMEs and `prompts/`.

## Fix or remove an entry

See [MEDIA-RIGHTS.md](MEDIA-RIGHTS.md).
