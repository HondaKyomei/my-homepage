# nanoFACTORY ホームページ改修計画

## 変更ファイル一覧

| ファイル | 状態 | 変更内容 |
|---|---|---|
| `index.html` | ✅ 変更済み | 構造再設計・Heroを3事業カードに変更・課題セクションを3事業対応に更新 |
| `styles.css` | ✅ 変更済み | デザイン統一・LP共通スタイル追加・不要スタイル削除 |
| `products-services/index.html` | ✅ 変更済み | 3製品カード → 3事業カードに再編、`example.com`リンク削除 |
| `nanostep-lp/index.html` | ✅ 新規作成 | nanoSTEP（AI作業管理・教育）LP |
| `nanosi-lp/index.html` | ✅ 新規作成 | nanoSI（AI自動検査SI）LP |
| `nanoguard-lp/index.html` | ✅ 新規作成 | nanoGUARD（AI監視・ルール順守）LP・既存3製品への導線 |
| `plan.md` | ✅ 更新済み | このファイル |

---

## 事業再編の命名

| 事業名 | 内容 | 対応LP |
|---|---|---|
| **nanoSTEP** | AI作業解析・OJT・作業保証システム | `nanostep-lp/` |
| **nanoSI** | AI自動検査装置システムインテグレーション | `nanosi-lp/` |
| **nanoGUARD** | AI監視・ルール順守カメラシステム（既製品） | `nanoguard-lp/` |

---

## サイト全体のリンク構造

```
index.html（トップ）
├── nanostep-lp/index.html         ← 新規
├── nanosi-lp/index.html            ← 新規
├── nanoguard-lp/index.html         ← 新規
│   ├── sanicam-lp/hand.html        ← 既存・変更なし
│   ├── virtual-security-gate-lp/index.html  ← 既存・変更なし
│   └── virtual-security-gate-lp/bear.html   ← 既存・変更なし
├── products-services/index.html    ← 変更済み（3事業に再編）
└── news/index.html                 ← 変更なし
```

---

## index.html の変更内容

### Heroカード（3製品 → 3事業）

| 変更前 | 変更後 |
|---|---|
| 熊検出AI → `virtual-security-gate-lp/bear.html` | nanoSTEP → `nanostep-lp/` |
| SANI-CAM → `sanicam-lp/hand.html` | nanoSI → `nanosi-lp/` |
| バーチャルセキュリティゲート → `virtual-security-gate-lp/index.html` | nanoGUARD → `nanoguard-lp/` |

### 課題セクション（#problems）の更新

| 変更前 | 変更後 |
|---|---|
| 現場リーダーへの負担集中 | 作業品質が属人化している（→nanoSTEP） |
| ルール順守率が上がらない | 検査システムが高い・融通が利かない（→nanoSI） |
| 野生動物・外部脅威への対応 | ルールが守られているか見えない（→nanoGUARD） |

---

## styles.css の変更内容

### 今回追加したLP共通スタイル（末尾に追加）

| クラス | 用途 |
|---|---|
| `.lp-hero` / `.lp-hero--blue/teal/guard` | LP用フルスクリーンヒーロー（事業別カラー3種） |
| `.lp-kicker` | 小見出しラベル（シアン色のpill型） |
| `.lp-h1` / `.lp-lead` | LP用見出し・リード文 |
| `.lp-section` / `.lp-section--dark/mid/deep` | LPセクションの背景バリエーション |
| `.checklist` / `.checklist__item` | 課題列挙カード（左ボーダーアクセント） |
| `.feature-grid` / `.feature-card` | 特長カードグリッド |
| `.flow-steps` / `.flow-step` | 導入フロー図 |
| `.showcase-grid` / `.showcase-card` | 製品ショーケース（nanoGUARD用） |

---

## 未変更ファイル（意図的に変更なし）

| ファイル | 理由 |
|---|---|
| `sanicam-lp/hand.html` | 完成度が高く、nanoGUARDから正しくリンクされている |
| `virtual-security-gate-lp/index.html` | 同上 |
| `virtual-security-gate-lp/bear.html` | 同上 |
| `news/index.html` | 変更不要 |
| `script.js` | 変更不要 |
