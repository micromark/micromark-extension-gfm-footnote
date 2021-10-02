# micromark-extension-gfm-footnote

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[micromark][]** extension to support GitHub Flavored Markdown (GFM) footnotes.
GFM footnotes were [announced September 30, 2021][post] but are neither
specified nor supported in all their products (e.g., Gists).
Their implementation on github.com is currently quite buggy.
The bugs have been reported on
[`cmark-gfm`](https://github.com/github/cmark-gfm).
This micromark extension matches github.com except for its bugs.

## When to use this

You should probably use [`micromark-extension-gfm`][micromark-extension-gfm]
instead, which combines this package with other GFM features.
Alternatively, if you don’t want all of GFM, use this package.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install micromark-extension-gfm-footnote
```

## Use

Say we have the following file, `example.md`:

````markdown
Using footnotes is fun![^1] They let you reference relevant information without disrupting the flow of what you’re trying to say.[^bignote]

[^1]: This is the first footnote.
[^bignote]: Here’s one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    ```
    my code
    ```

    Add as many paragraphs as you like.

Text here and here and here.
[Learn more about markdown and footnotes in markdown](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes)
````

And our module, `example.js`, looks as follows:

```js
import fs from 'node:fs'
import {micromark} from 'micromark'
import {gfmFootnote, gfmFootnoteHtml} from 'micromark-extension-gfm-footnote'

const output = micromark(fs.readFileSync('example.md'), {
  extensions: [gfmFootnote()],
  htmlExtensions: [gfmFootnoteHtml()]
})

console.log(output)
```

Now, running `node example` yields:

```html
<p>Using footnotes is fun!<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup> They let you reference relevant information without disrupting the flow of what you’re trying to say.<sup><a href="#user-content-fn-bignote" id="user-content-fnref-bignote" data-footnote-ref="" aria-describedby="footnote-label">2</a></sup></p>
<p>Text here and here and here.
<a href="https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes">Learn more about markdown and footnotes in markdown</a></p>
<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>This is the first footnote. <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
<li id="user-content-fn-bignote">
<p>Here’s one with multiple paragraphs and code.</p>
<p>Indent paragraphs to include them in the footnote.</p>
<pre><code>my code
</code></pre>
<p>Add as many paragraphs as you like. <a href="#user-content-fnref-bignote" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>
```

## API

This package exports the following identifiers: `gfmFootnote`,
`gfmFootnoteHtml`.
There is no default export.

The export map supports the endorsed
[`development` condition](https://nodejs.org/api/packages.html#packages\_resolving\_user\_conditions).
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmFootnote()`

### `gfmFootnoteHtml(htmlOptions)`

A function that can be called to get an extension for micromark to parse
GFM footnotes (can be passed in `extensions`) and a function that can be called
to get an extension to compile them to HTML (can be passed in `htmlExtensions`).

###### `htmlOptions.clobberPrefix`

Prefix to use before the `id` attribute to prevent it from *clobbering*
attributes (`string`, default: `'user-content-'`).
DOM clobbering is this:

```html
<p id=x></p>
<script>alert(x)</script>
```

Elements by their ID are made available in browsers on the `window` object.
Using a prefix this that from being a problem.

###### `htmlOptions.label`

Label to use for the footnotes section (`string`, default: `'Footnotes'`).
Affects screen reader users.
Change it if you’re authoring in a different language.

###### `htmlOptions.backLabel`

Label to use from backreferences back to their footnote call (`string`, default:
`'Back to content'`).
Affects screen reader users.
Change it if you’re authoring in a different language.

## Recommended CSS

The following CSS is needed to make footnotes look a bit like GitHub.
For the complete actual CSS see
[`sindresorhus/github-markdown-css`](https://github.com/sindresorhus/github-markdown-css).

```css
/* Style the footnotes section. */
.footnotes {
  font-size: smaller;
  color: #8b949e;
  border-top: 1px solid #30363d;
}

/* Hide the section label for visual users. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  word-wrap: normal;
  border: 0;
}

/* Place `[` and `]` around footnote calls. */
[data-footnote-ref]::before {
  content: '[';
}

[data-footnote-ref]::after {
  content: ']';
}
```

## Related

*   [`remarkjs/remark`][remark]
    — markdown processor powered by plugins
*   [`remarkjs/remark-gfm`][remark-gfm]
    — remark plugin using this to support all of GFM
*   [`micromark/micromark`][micromark]
    — the smallest commonmark-compliant markdown parser that exists
*   [`syntax-tree/mdast-util-gfm-footnote`][mdast-util-gfm-footnote]
    — mdast utility to support GFM footnotes
*   [`syntax-tree/mdast-util-from-markdown`][from-markdown]
    — mdast parser using `micromark` to create mdast from markdown
*   [`syntax-tree/mdast-util-to-markdown`][to-markdown]
    — mdast serializer to create markdown from mdast

## Contribute

See [`contributing.md` in `micromark/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/micromark/micromark-extension-gfm-footnote/workflows/main/badge.svg

[build]: https://github.com/micromark/micromark-extension-gfm-footnote/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/micromark/micromark-extension-gfm-footnote.svg

[coverage]: https://codecov.io/github/micromark/micromark-extension-gfm-footnote

[downloads-badge]: https://img.shields.io/npm/dm/micromark-extension-gfm-footnote.svg

[downloads]: https://www.npmjs.com/package/micromark-extension-gfm-footnote

[size-badge]: https://img.shields.io/bundlephobia/minzip/micromark-extension-gfm-footnote.svg

[size]: https://bundlephobia.com/result?p=micromark-extension-gfm-footnote

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/micromark/micromark/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[micromark]: https://github.com/micromark/micromark

[from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[remark]: https://github.com/remarkjs/remark

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[mdast-util-gfm-footnote]: https://github.com/syntax-tree/mdast-util-gfm-footnote

[remark-gfm]: https://github.com/remarkjs/remark-gfm

[post]: https://github.blog/changelog/2021-09-30-footnotes-now-supported-in-markdown-fields/
