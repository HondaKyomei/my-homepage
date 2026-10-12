/**
 * 日本語の改行を文節単位にする（スマホで「一⏎歩」のように語の途中で切れるのを防ぐ）。
 * BudouX 0.9.3 (Apache-2.0, https://github.com/google/budoux) を同梱。
 * 文節の境目に <wbr> を入れ、ブロックに word-break:keep-all を付ける。
 * <wbr> は textContent に影響しない。収まらない語は overflow-wrap:anywhere で折り返す。
 */
import { HTMLProcessingParser } from './budoux/html_processor.js';
import { model } from './budoux/ja.js';

const parser = new HTMLProcessingParser(model, { separator: document.createElement('wbr') });
parser.applyToElement(document.body);
