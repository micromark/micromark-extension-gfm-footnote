import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {micromark} from 'micromark'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {gfmFootnote, gfmFootnoteHtml} from 'micromark-extension-gfm-footnote'

test('core', async () => {
  assert.deepEqual(
    Object.keys(await import('micromark-extension-gfm-footnote')).sort(),
    ['gfmFootnote', 'gfmFootnoteHtml'],
    'should expose the public api'
  )
})

test('markdown -> html (micromark)', () => {
  assert.deepEqual(
    micromark('^[inline]', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>^[inline]</p>',
    'should not support inline footnotes'
  )

  assert.deepEqual(
    micromark('A paragraph.\n\n[^a]: whatevs', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>A paragraph.</p>\n',
    'should ignore definitions w/o calls'
  )

  assert.deepEqual(
    micromark('A call.[^a]\n\n[^a]: whatevs', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>A call.<sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a">\n<p>whatevs <a href="#user-content-fnref-a" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support calls and definitions'
  )

  assert.deepEqual(
    micromark('Noot.[^a]\n\n[^a]: dingen', {
      extensions: [gfmFootnote()],
      htmlExtensions: [
        gfmFootnoteHtml({label: 'Voetnoten', backLabel: 'Terug naar de inhoud'})
      ]
    }),
    '<p>Noot.<sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Voetnoten</h2>\n<ol>\n<li id="user-content-fn-a">\n<p>dingen <a href="#user-content-fnref-a" data-footnote-backref="" class="data-footnote-backref" aria-label="Terug naar de inhoud">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support `options.label`, `options.backLabel`'
  )

  assert.deepEqual(
    micromark('a[^1]\n\n[^1]: b', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml({clobberPrefix: ''})]
    }),
    '<p>a<sup><a href="#fn-1" id="fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="fn-1">\n<p>b <a href="#fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support `options.clobberPrefix`'
  )

  // 999 `x` characters.
  const max = Array.from({length: 1000}).join('x')

  assert.deepEqual(
    micromark('Call.[^' + max + '].\n\n[^' + max + ']: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
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

  assert.deepEqual(
    micromark('Call.[^a' + max + '].\n\n[^a' + max + ']: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.[^a' + max + '].</p>\n<p>[^a' + max + ']: y</p>',
    'should not support 1000 characters in a call / definition'
  )

  // <https://github.com/github/cmark-gfm/issues/239>
  assert.deepEqual(
    micromark('Call.[^a\\+b].\n\n[^a\\+b]: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a%5C+b" id="user-content-fnref-a%5C+b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a%5C+b">\n<p>y <a href="#user-content-fnref-a%5C+b" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a character escape in a call / definition'
  )

  assert.deepEqual(
    micromark('Call.[^a&copy;b].\n\n[^a&copy;b]: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a&amp;copy;b" id="user-content-fnref-a&amp;copy;b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a&amp;copy;b">\n<p>y <a href="#user-content-fnref-a&amp;copy;b" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a character reference in a call / definition'
  )

  // <https://github.com/github/cmark-gfm/issues/239>
  // <https://github.com/github/cmark-gfm/issues/240>
  assert.deepEqual(
    micromark('Call.[^a\\]b].\n\n[^a\\]b]: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a%5C%5Db" id="user-content-fnref-a%5C%5Db" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a%5C%5Db">\n<p>y <a href="#user-content-fnref-a%5C%5Db" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a useful character escape in a call / definition'
  )

  assert.deepEqual(
    micromark('Call.[^a&#91;b].\n\n[^a&#91;b]: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.<sup><a href="#user-content-fn-a&amp;#91;b" id="user-content-fnref-a&amp;#91;b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a&amp;#91;b">\n<p>y <a href="#user-content-fnref-a&amp;#91;b" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support a useful character reference in a call / definition'
  )

  assert.deepEqual(
    micromark('Call.[^a\\+b].\n\n[^a+b]: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.[^a+b].</p>\n',
    'should match calls to definitions on the source of the label, not on resolved escapes'
  )

  assert.deepEqual(
    micromark('Call.[^a&#91;b].\n\n[^a\\[b]: y', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p>Call.[^a[b].</p>\n',
    'should match calls to definitions on the source of the label, not on resolved references'
  )

  assert.deepEqual(
    micromark('[^1].\n\n[^1]: a\nb', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support lazyness (1)'
  )

  assert.deepEqual(
    micromark('[^1].\n\n> [^1]: a\nb', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<blockquote>\n</blockquote>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support lazyness (2)'
  )

  assert.deepEqual(
    micromark('[^1].\n\n> [^1]: a\n> b', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<blockquote>\n</blockquote>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>\n</li>\n</ol>\n</section>',
    'should support lazyness (3)'
  )

  assert.deepEqual(
    micromark('[^1].\n\n[^1]: a\n\n    > b', {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
    }),
    '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a</p>\n<blockquote>\n<p>b</p>\n</blockquote>\n<a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a>\n</li>\n</ol>\n</section>',
    'should support lazyness (4)'
  )
})

test('fixtures', async () => {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base, {
    rehypeStringify: {closeSelfClosing: true}
  })

  const files = await fs.readdir(base)
  const extension = '.md'
  let index = -1

  while (++index < files.length) {
    const d = files[index]

    if (!d.endsWith(extension)) {
      continue
    }

    const name = d.slice(0, -extension.length)
    const input = await fs.readFile(new URL(name + '.md', base))
    let expected = String(await fs.readFile(new URL(name + '.html', base)))
    let actual = micromark(input, {
      extensions: [gfmFootnote()],
      htmlExtensions: [gfmFootnoteHtml()]
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

    assert.equal(actual, expected, name)
  }
})
