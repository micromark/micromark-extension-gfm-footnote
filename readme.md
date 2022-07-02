# micromark-extension-gfm-footnote

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[micromark][] extension support GFM [footnotes][post].

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`gfmFootnote()`](#gfmfootnote)
    *   [`gfmFootnoteHtml(htmlOptions)`](#gfmfootnotehtmlhtmloptions)
*   [Authoring](#authoring)
*   [HTML](#html)
*   [CSS](#css)
*   [Syntax](#syntax)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for the footnote enabled by
GFM to [`micromark`][micromark].

GitHub announced footnotes [on September 30, 2021][post] but did not specify
them in their GFM spec.
As they are implemented in their parser and supported in all places where
other GFM features work, they can be considered part of GFM.
GitHub employs several other features (such as mentions or frontmatter) that
are either not in their parser, or not in all places where GFM features work,
which should not be considered GFM.

The implementation of footnotes on github.com is currently a bit buggy.
The bugs have been reported on [`cmark-gfm`][cmark-gfm].
This micromark extension matches github.com except for its bugs.

## When to use this

These tools are all low-level.
In many cases, you want to use [`remark-gfm`][plugin] with remark instead.

Even when you want to use `micromark`, you likely want to use
[`micromark-extension-gfm`][micromark-extension-gfm] to support all GFM
features.
That extension includes this extension.

When working with `mdast-util-from-markdown`, you must combine this package with
[`mdast-util-gfm-footnote`][util].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install micromark-extension-gfm-footnote
```

In Deno with [`esm.sh`][esmsh]:

```js
import {gfmFootnote, gfmFootnoteHtml} from 'https://esm.sh/micromark-extension-gfm-footnote@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {gfmFootnote, gfmFootnoteHtml} from 'https://esm.sh/micromark-extension-gfm-footnote@1?bundle'
</script>
```

## Use

Say our document `example.md` contains:

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

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {micromark} from 'micromark'
import {gfmFootnote, gfmFootnoteHtml} from 'micromark-extension-gfm-footnote'

const output = micromark(await fs.readFile('example.md'), {
  extensions: [gfmFootnote()],
  htmlExtensions: [gfmFootnoteHtml()]
})

console.log(output)
```

…now running `node example.js` yields:

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

This package exports the identifiers `gfmFootnote` and `gfmFootnoteHtml`.
There is no default export.

The export map supports the endorsed [`development` condition][condition].
Run `node --conditions development module.js` to get instrumented dev code.
Without this condition, production code is loaded.

### `gfmFootnote()`

Function that can be called (no options yet) to get a syntax extension for
micromark (passed in `extensions`).

### `gfmFootnoteHtml(htmlOptions)`

Function that can be called to get an HTML extension for micromark (passed
in `htmlExtensions`).

###### `htmlOptions`

Configuration (optional).

###### `htmlOptions.clobberPrefix`

Prefix to use before the `id` attribute to prevent it from *clobbering*
(`string`, default: `'user-content-'`).
DOM clobbering is this:

```html
<p id=x></p>
<script>console.log(x)</script>
<!-- The element is printed to the console. -->
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

## Authoring

When authoring markdown with footnotes, it’s recommended to use words instead
of numbers (or letters or anything with an order) as references.
That makes it easier to reuse and reorder footnotes.

It’s recommended to place footnotes definitions at the bottom of the document.

## HTML

GFM footnotes relate to several HTML elements and ARIA properties.
The structure for generated references looks as follows:

```html
<sup><a href="#user-content-fn-xxx" id="user-content-fnref-xxx" data-footnote-ref="" aria-describedby="footnote-label">111</a></sup></p>
```

Where `xxx` is the identifier used in the markdown source, and `111` the number
of corresponding, listed, definition.

See [*§ 4.5.19 The `sub` and `sup` elements*][html-sup],
[*§ 4.5.1 The `a` element*][html-a], and
[*§ 3.2.6.6 Embedding custom non-visible data with the `data-*`
attributes*][html-data]
in the HTML spec, and
[*§ 6.7 `aria-describedby` property*][aria-describedby]
in WAI-ARIA, for more info.

The structure for the section at the end of the document that contains
generated definitions looks as follows:

```html
<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>
<ol>
<!--…-->
</ol>
</section>
```

See [*§ 4.3.3 The `section` element*][html-section],
[*§ 4.3.6 The `h1`, `h2`, `h3`, `h4`, `h5`, and `h6` elements*][html-h], and
[*§ 4.4.5 The `ol` element*][html-ol]
in the HTML spec for more info.

The structure for each generated definition looks as follows:

```html
<li id="user-content-fn-xxx">
yyy
<a href="#user-content-fnref-xxx" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a>
</li>
```

Where `xxx` is the identifier used in the markdown source and `yyy` the content
used in the definition.

See [*§ 4.4.8 The `li` element*][html-li],
[*§ 4.5.1 The `a` element*][html-a], and
[*§ 3.2.6.6 Embedding custom non-visible data with the `data-*`
attributes*][html-data]
in the HTML spec, and
[*§ 6.7 `aria-label` property*][aria-label]
in WAI-ARIA, for more info.

## CSS

The following CSS is needed to make footnotes look a bit like GitHub (and fixes
a bug).
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

## Syntax

Footnotes form with, roughly, the following BNF:

```bnf
footnote_reference ::= label_footnote
; Restriction: any indent is eaten after `:`, indented code is not possible
footnote_definition ::= label_footnote ':' 0.*space_or_tab 0.*code *( eol *( blank_line eol ) indented_filled_line )

; Restriction: maximum `999` codes allowed inside.
; Restriction: no blank lines.
; Restriction: at least 1 non-space and non-eol code must exist.
label_footnote ::= '[' '^' *( code - '[' - '\\' - ']' | '\\' [ '[' | '\\' | ']' ] ) ']'
; Restriction: at least one `code` must not be whitespace.
indented_filled_line ::= 4space_or_tab *code
blank_line ::= *space_or_tab
eol ::= '\r' | '\r\n' | '\n'
space_or_tab ::= ' ' | '\t'
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional type `HtmlOptions`.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.
Setting `htmlOptions.clobberPrefix = ''` is dangerous.

## Related

*   [`syntax-tree/mdast-util-gfm-footnote`][util]
    — support GFM footnotes in mdast
*   [`syntax-tree/mdast-util-gfm`][mdast-util-gfm]
    — support GFM in mdast
*   [`remarkjs/remark-gfm`][plugin]
    — support GFM in remark

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

[esmsh]: https://esm.sh

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/micromark/.github/blob/HEAD/contributing.md

[support]: https://github.com/micromark/.github/blob/HEAD/support.md

[coc]: https://github.com/micromark/.github/blob/HEAD/code-of-conduct.md

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[condition]: https://nodejs.org/api/packages.html#packages_resolving_user_conditions

[micromark]: https://github.com/micromark/micromark

[micromark-extension-gfm]: https://github.com/micromark/micromark-extension-gfm

[util]: https://github.com/syntax-tree/mdast-util-gfm-footnote

[mdast-util-gfm]: https://github.com/syntax-tree/mdast-util-gfm

[plugin]: https://github.com/remarkjs/remark-gfm

[post]: https://github.blog/changelog/2021-09-30-footnotes-now-supported-in-markdown-fields/

[cmark-gfm]: https://github.com/github/cmark-gfm

[html-a]: https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element

[html-data]: https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes

[html-h]: https://html.spec.whatwg.org/multipage/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements

[html-li]: https://html.spec.whatwg.org/multipage/grouping-content.html#the-li-element

[html-ol]: https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element

[html-section]: https://html.spec.whatwg.org/multipage/sections.html#the-section-element

[html-sup]: https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-sub-and-sup-elements

[aria-describedby]: https://w3c.github.io/aria/#aria-describedby

[aria-label]: https://w3c.github.io/aria/#aria-label
