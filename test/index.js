import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'
import {micromark} from 'micromark'
import {createGfmFixtures} from 'create-gfm-fixtures'
import {gfmFootnote, gfmFootnoteHtml} from 'micromark-extension-gfm-footnote'

test('micromark-extension-gfm-footnote', async function (t) {
  // 999 `x` characters.
  const max = Array.from({length: 1000}).join('x')

  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('micromark-extension-gfm-footnote')).sort(),
      ['defaultBackLabel', 'gfmFootnote', 'gfmFootnoteHtml']
    )
  })

  await t.test('should not support inline footnotes', async function () {
    assert.deepEqual(
      micromark('^[inline]', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p>^[inline]</p>'
    )
  })

  await t.test('should ignore definitions w/o calls', async function () {
    assert.deepEqual(
      micromark('A paragraph.\n\n[^a]: whatevs', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p>A paragraph.</p>\n'
    )
  })

  await t.test('should support calls and definitions', async function () {
    assert.deepEqual(
      micromark('A call.[^a]\n\n[^a]: whatevs', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p>A call.<sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a">\n<p>whatevs <a href="#user-content-fnref-a" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test(
    'should skip calls and definitions  construct if `disable.null` includes `footnoteDefinition` and `footnoteCall`',
    async function () {
      assert.deepEqual(
        micromark('A call.[^a]\n\n[^a]: whatevs', {
          extensions: [
            gfmFootnote(),
            {
              disable: {
                null: [
                  'footnoteDefinition',
                  'footnoteCall',
                  'potentialFootnoteCall'
                ]
              }
            }
          ],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>A call.<a href="whatevs">^a</a></p>\n'
      )
    }
  )

  await t.test(
    'should support `options.label`, `options.backLabel`',
    async function () {
      assert.deepEqual(
        micromark('Noot.[^a]\n\n[^a]: dingen', {
          extensions: [gfmFootnote()],
          htmlExtensions: [
            gfmFootnoteHtml({
              label: 'Voetnoten',
              backLabel: 'Terug naar de inhoud'
            })
          ]
        }),
        '<p>Noot.<sup><a href="#user-content-fn-a" id="user-content-fnref-a" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Voetnoten</h2>\n<ol>\n<li id="user-content-fn-a">\n<p>dingen <a href="#user-content-fnref-a" data-footnote-backref="" aria-label="Terug naar de inhoud" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
      )
    }
  )

  await t.test('should support `options.labelTagName`', async function () {
    assert.deepEqual(
      micromark('a[^b]\n\n[^b]: c', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml({labelTagName: 'h1'})]
      }),
      '<p>a<sup><a href="#user-content-fn-b" id="user-content-fnref-b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h1 id="footnote-label" class="sr-only">Footnotes</h1>\n<ol>\n<li id="user-content-fn-b">\n<p>c <a href="#user-content-fnref-b" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support `options.labelAttributes`', async function () {
    assert.deepEqual(
      micromark('a[^b]\n\n[^b]: c', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml({labelAttributes: ''})]
      }),
      '<p>a<sup><a href="#user-content-fn-b" id="user-content-fnref-b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label">Footnotes</h2>\n<ol>\n<li id="user-content-fn-b">\n<p>c <a href="#user-content-fnref-b" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support `options.clobberPrefix`', async function () {
    assert.deepEqual(
      micromark('a[^1]\n\n[^1]: b', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml({clobberPrefix: ''})]
      }),
      '<p>a<sup><a href="#fn-1" id="fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup></p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="fn-1">\n<p>b <a href="#fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test(
    'should support 999 characters in a call / definition',
    async function () {
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
          '" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
      )
    }
  )

  await t.test(
    'should not support 1000 characters in a call / definition',
    async function () {
      assert.deepEqual(
        micromark('Call.[^a' + max + '].\n\n[^a' + max + ']: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.[^a' + max + '].</p>\n<p>[^a' + max + ']: y</p>'
      )
    }
  )

  await t.test(
    'should support a character escape in a call / definition',
    async function () {
      // <https://github.com/github/cmark-gfm/issues/239>
      assert.deepEqual(
        micromark('Call.[^a\\+b].\n\n[^a\\+b]: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.<sup><a href="#user-content-fn-a%5C+b" id="user-content-fnref-a%5C+b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a%5C+b">\n<p>y <a href="#user-content-fnref-a%5C+b" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
      )
    }
  )

  await t.test(
    'should support a character reference in a call / definition',
    async function () {
      assert.deepEqual(
        micromark('Call.[^a&copy;b].\n\n[^a&copy;b]: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.<sup><a href="#user-content-fn-a&amp;copy;b" id="user-content-fnref-a&amp;copy;b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a&amp;copy;b">\n<p>y <a href="#user-content-fnref-a&amp;copy;b" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
      )
    }
  )

  await t.test(
    'should support a useful character escape in a call / definition',
    async function () {
      // <https://github.com/github/cmark-gfm/issues/239>
      // <https://github.com/github/cmark-gfm/issues/240>
      assert.deepEqual(
        micromark('Call.[^a\\]b].\n\n[^a\\]b]: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.<sup><a href="#user-content-fn-a%5C%5Db" id="user-content-fnref-a%5C%5Db" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a%5C%5Db">\n<p>y <a href="#user-content-fnref-a%5C%5Db" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
      )
    }
  )

  await t.test(
    'should support a useful character reference in a call / definition',
    async function () {
      assert.deepEqual(
        micromark('Call.[^a&#91;b].\n\n[^a&#91;b]: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.<sup><a href="#user-content-fn-a&amp;#91;b" id="user-content-fnref-a&amp;#91;b" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-a&amp;#91;b">\n<p>y <a href="#user-content-fnref-a&amp;#91;b" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
      )
    }
  )

  await t.test(
    'should match calls to definitions on the source of the label, not on resolved escapes',
    async function () {
      assert.deepEqual(
        micromark('Call.[^a\\+b].\n\n[^a+b]: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.[^a+b].</p>\n'
      )
    }
  )

  await t.test(
    'should match calls to definitions on the source of the label, not on resolved references',
    async function () {
      assert.deepEqual(
        micromark('Call.[^a&#91;b].\n\n[^a\\[b]: y', {
          extensions: [gfmFootnote()],
          htmlExtensions: [gfmFootnoteHtml()]
        }),
        '<p>Call.[^a[b].</p>\n'
      )
    }
  )

  await t.test('should support lazyness (1)', async function () {
    assert.deepEqual(
      micromark('[^1].\n\n[^1]: a\nb', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support lazyness (2)', async function () {
    assert.deepEqual(
      micromark('[^1].\n\n> [^1]: a\nb', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<blockquote>\n</blockquote>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support lazyness (3)', async function () {
    assert.deepEqual(
      micromark('[^1].\n\n> [^1]: a\n> b', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<blockquote>\n</blockquote>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a\nb <a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a></p>\n</li>\n</ol>\n</section>'
    )
  })

  await t.test('should support lazyness (4)', async function () {
    assert.deepEqual(
      micromark('[^1].\n\n[^1]: a\n\n    > b', {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()]
      }),
      '<p><sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup>.</p>\n<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>\n<ol>\n<li id="user-content-fn-1">\n<p>a</p>\n<blockquote>\n<p>b</p>\n</blockquote>\n<a href="#user-content-fnref-1" data-footnote-backref="" aria-label="Back to reference 1" class="data-footnote-backref">↩</a>\n</li>\n</ol>\n</section>'
    )
  })
})

test('fixtures', async function (t) {
  const base = new URL('fixtures/', import.meta.url)

  await createGfmFixtures(base, {
    rehypeStringify: {closeSelfClosing: true}
  })

  const files = await fs.readdir(base)
  const extension = '.md'

  for (const d of files) {
    if (!d.endsWith(extension)) {
      continue
    }

    const name = d.slice(0, -extension.length)

    await t.test(name, async function () {
      const input = await fs.readFile(new URL(name + '.md', base))
      let expected = String(await fs.readFile(new URL(name + '.html', base)))
      let actual = micromark(input, {
        extensions: [gfmFootnote()],
        htmlExtensions: [gfmFootnoteHtml()],
        allowDangerousHtml: true
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

      if (
        name === 'constructs-in-footnotes-first' ||
        name === 'constructs-in-footnotes-after-blank' ||
        name === 'constructs-in-footnotes-rest'
      ) {
        // GH uses weird code.
        expected = expected.replace(
          /<pre lang="js"><code>/,
          '<pre><code class="language-js">'
        )
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
            /<li id="user-content-fn-https:\/\/example\.com">\n<p>a ↩<\/p>/,
            '<li id="user-content-fn-https://example.com">\n<p>a <a href="#user-content-fnref-https://example.com" data-footnote-backref="" aria-label="Back to reference 5" class="data-footnote-backref">↩</a></p>'
          )
          .replace(
            /<li id="user-content-fn-:\/\/example\.com">\n<p>a ↩<\/p>/,
            '<li id="user-content-fn-://example.com">\n<p>a <a href="#user-content-fnref-://example.com" data-footnote-backref="" aria-label="Back to reference 6" class="data-footnote-backref">↩</a></p>'
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

      assert.equal(actual, expected)
    })
  }
})
