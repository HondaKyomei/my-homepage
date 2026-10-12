# my-homepage

nanoFACTORY 公式サイト（https://nano-factory.net/）のソース。

## 公開

- `redesign-2026` ブランチを GitHub Pages で配信しています（`main` は旧版で使っていません）。
- `redesign-2026` に push すると、約1分で本番に反映されます。

## 日本語の改行（BudouX）

スマホで「一⏎歩」のように言葉の途中で改行されないよう、全ページで文節単位の改行を有効にしています。

- `assets/js/linebreak-ja.js` が、ページ読み込み後に文節の境目へ `<wbr>` を入れます。iPhone（Safari）でも効きます。
- 本体は [BudouX](https://github.com/google/budoux) 0.9.3（Apache-2.0）を `assets/js/budoux/` に同梱しています。外部CDNは使いません。

### 新しいページを作るとき

`</body>` の直前に次の1行を入れてください。

```html
<script type="module" src="/assets/js/linebreak-ja.js?v=20261012"></script>
```

### それでも言葉が切れるとき

BudouX が区切りを誤る語（例：「完全無人化」「一体化」）や、住所・長いカタカナの社名は、個別に改行を止めます。

```html
<span style="white-space:nowrap">完全無人化</span>
```

表の列が細く1文字ずつ折れる場合は、スマホ用の CSS で列幅を広げるか、表に `min-width` を付けて横スクロールにします。
