import {URL} from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {micromark} from 'micromark'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {gfmFootnote as syntax, gfmFootnoteHtml as html} from '../dev/index.js'

test('markdown -> html (micromark)', (t) => {
  t.deepEqual(
    micromark('^[inline]', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>^[inline]</p>',
    'should not support inline footnotes'
  )

  t.deepEqual(
    micromark('A paragraph.\n\n[^a]: whatevs', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>A paragraph.</p>\n',
    'should ignore definitions w/o calls'
  )

  t.deepEqual(
    micromark('A call.[^a]\n\n[^a]: whatevs', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>A call.<sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a">\n<p>whatevs <a href="#user-content-fnref-a" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support calls and definitions'
  )

  t.deepEqual(
    micromark('Noot.[^a]\n\n[^a]: dingen', {
      extensions: [syntax()],
      htmlExtensions: [
        html({label: 'Voetnoten', backLabel: 'Terug naar de inhoud'})
      ]
    }),
    '<p>Noot.<sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Voetnoten</h2>\n<ol>\n<li id="user-content-fn-a">\n<p>dingen <a href="#user-content-fnref-a" data-footnote-backref="" class="data-footnote-backref" aria-label="Terug naar de inhoud">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support `options.label`, `options.backLabel`'
  )

  t.deepEqual(
    micromark('a[^1]\n\n[^1]: b', {
      extensions: [syntax()],
      htmlExtensions: [html({clobberPrefix: ''})]
    }),
    '<p>a<sup><a href="#fn-1" id="fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="fn-1">\n<p>b <a href="#fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support `options.clobberPrefix`'
  )

  // 999 `x` characters.
  const max = Array.from({length: 1000}).join('x')

  t.deepEqual(
    micromark('Call.[^' + max + '].\n\n[^' + max + ']: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-' +
      max +
      '" id="user-content-fnref-' +
      max +
      '" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-' +
      max +
      '">\n<p>y <a href="#user-content-fnref-' +
      max +
      '" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support 999 characters in a call / definition'
  )

  t.deepEqual(
    micromark('Call.[^a' + max + '].\n\n[^a' + max + ']: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.[^a' + max + '].</p>\n<p>[^a' + max + ']: y</p>',
    'should not support 1000 characters in a call / definition'
  )

  // <https://github.com/github/cmark-gfm/issues/239>
  t.deepEqual(
    micromark('Call.[^a\\+b].\n\n[^a\\+b]: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a%5C+b" id="user-content-fnref-a%5C+b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a%5C+b">\n<p>y <a href="#user-content-fnref-a%5C+b" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a character escape in a call / definition'
  )

  t.deepEqual(
    micromark('Call.[^a&copy;b].\n\n[^a&copy;b]: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a&amp;copy;b" id="user-content-fnref-a&amp;copy;b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a&amp;copy;b">\n<p>y <a href="#user-content-fnref-a&amp;copy;b" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a character reference in a call / definition'
  )

  // <https://github.com/github/cmark-gfm/issues/239>
  // <https://github.com/github/cmark-gfm/issues/240>
  t.deepEqual(
    micromark('Call.[^a\\]b].\n\n[^a\\]b]: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a%5C%5Db" id="user-content-fnref-a%5C%5Db" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a%5C%5Db">\n<p>y <a href="#user-content-fnref-a%5C%5Db" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a useful character escape in a call / definition'
  )

  t.deepEqual(
    micromark('Call.[^a&#91;b].\n\n[^a&#91;b]: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a&amp;#91;b" id="user-content-fnref-a&amp;#91;b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a&amp;#91;b">\n<p>y <a href="#user-content-fnref-a&amp;#91;b" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a useful character reference in a call / definition'
  )

  t.deepEqual(
    micromark('Call.[^a\\+b].\n\n[^a+b]: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.[^a+b].</p>\n',
    'should match calls to definitions on the source of the label, not on resolved escapes'
  )

  t.deepEqual(
    micromark('Call.[^a&#91;b].\n\n[^a\\[b]: y', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p>Call.[^a[b].</p>\n',
    'should match calls to definitions on the source of the label, not on resolved references'
  )

  t.deepEqual(
    micromark('[^1].\n\n[^1]: a\nb', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support lazyness (1)'
  )

  t.deepEqual(
    micromark('[^1].\n\n> [^1]: a\nb', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<blockquote>\n</blockquote>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support lazyness (2)'
  )

  t.deepEqual(
    micromark('[^1].\n\n> [^1]: a\n> b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<blockquote>\n</blockquote>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support lazyness (3)'
  )

  t.deepEqual(
    micromark('[^1].\n\n[^1]: a\n\n    > b', {
      extensions: [syntax()],
      htmlExtensions: [html()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a</p>\n<blockquote>\n<p>b</p>\n</blockquote>\n<a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a>\n</li>\n</ol>\n</section>',
    'should support lazyness (4)'
  )

  t.end()
})

test('fixtures', async (t) => {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base, {
    rehypeStringify: {closeSelfClosing: true}
  })

  const files = fs.readdirSync(base).filter((d) => /\.md$/.test(d))
  let index = -1

  while (++index < files.length) {
    const name = path.basename(files[index], '.md')
    const input = fs.readFileSync(new URL(name + '.md', base))
    let expected = String(fs.readFileSync(new URL(name + '.html', base)))
    let actual = micromark(input, {
      extensions: [syntax()],
      htmlExtensions: [html()]
    })

    if (actual && !/\n$/.test(actual)) {
      actual += '\n'
    }

    // GH strips images that point to just a search or hash.
    actual = actual.replace(/src="[?#][^"]*"/g, 'src=""')

    // GH uses different casing for percent-encoding in IDs and hrefs.
    // This breaks their implementation.
    // See: <https://github.com/github/cmark-gfm/issues/239>
    if (name === 'calls') {
      expected = expected.replace(/%5e/g, '%5E')
    }

    if (name === 'constructs-in-identifiers') {
      // GH does not support colons:
      // See: <https://github.com/github/cmark-gfm/issues/250>
      expected = expected
        // Forward links
        .replace(
          /<a id="user-content-fnref-https:\/\/example\.com"/,
          '<a href="#user-content-fn-https://example.com" id="user-content-fnref-https://example.com"'
        )
        .replace(
          /<a id="user-content-fnref-:\/\/example\.com"/,
          '<a href="#user-content-fn-://example.com" id="user-content-fnref-://example.com"'
        )
        // Backward links
        .replace(
          /<li id="user-content-fn-https:\/\/example\.com">\n<p>a ↩<\/p>\n<\/li>/,
          '<li id="user-content-fn-https://example.com">\n<p>a <a href="#user-content-fnref-https://example.com" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>'
        )
        .replace(
          /<li id="user-content-fn-:\/\/example\.com">\n<p>a ↩<\/p>\n<\/li>/,
          '<li id="user-content-fn-://example.com">\n<p>a <a href="#user-content-fnref-://example.com" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>'
        )

      // GH doesn’t allow images in what could otherwise be a footnote:
      // `[^![image](#)]`.
      // This seems like a bug.
      expected = expected.replace(
        /!\[image]\(#\)/g,
        '<img src="" alt="image" />'
      )
    }

    // GH doesn’t properly support footnotes in links.
    // See: <https://github.com/github/cmark-gfm/issues/249>
    if (name === 'footnotes-in-constructs') {
      expected = expected.replace(
        /<a href="#">link<sup><\/sup><\/a><a href="#user-content-fn-5" id="user-content-fnref-5" data-footnote-ref="" aria-describedby="footnote-label">4<\/a>/,
        '<a href="#">link<sup><a href="#user-content-fn-5" id="user-content-fnref-5" data-footnote-ref="" aria-describedby="footnote-label">4</a></sup></a>'
      )
    }

    t.equal(actual, expected, name)
  }

  t.end()
})
