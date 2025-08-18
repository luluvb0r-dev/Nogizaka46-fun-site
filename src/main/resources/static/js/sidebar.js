// サイドバー「コール」開閉と初回のみ /api/singles を取得してリストを生成するスクリプト
// - defer で読み込む前提（DOM構築後に動く）
// - 連打での二重フェッチ対策（loadingフラグ）
// - 取得失敗時のメッセージ表示
// - アクセシビリティ属性（aria-*）を適切に更新

(() => {
  'use strict';

  // DOM構築後に初期化
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('calls-toggle');
    const list   = document.getElementById('calls-list');

    // このフラグメントが無いページでは何もしない
    if (!toggle || !list) return;

    let loaded  = false; // すでにデータを読み込んだか
    let loading = false; // 取得中か（多重実行防止）

    const HIDDEN = 'hidden';
    const STORAGE_KEY = 'calls-open';

    // 状態を保存する
    const saveState = (open) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, open ? '1' : '0');
      } catch (e) {
        console.debug('[sidebar] failed to save state', e);
      }
    };

    // 表示/非表示と aria を同期させる
    const show = (visible) => {
      if (visible) {
        list.classList.remove(HIDDEN);
        toggle.setAttribute('aria-expanded', 'true');
        list.setAttribute('aria-hidden', 'false');
      } else {
        list.classList.add(HIDDEN);
        toggle.setAttribute('aria-expanded', 'false');
        list.setAttribute('aria-hidden', 'true');
      }
    };

    // 初期状態は閉じる
    show(false);

    // クリックで開閉（未読込なら初回のみ取得）
    toggle.addEventListener('click', async (e) => {
      e.preventDefault(); // href="#" のページ先頭ジャンプを抑止

      // まだ取得していない場合だけAPIを叩く
      if (!loaded) {
        if (loading) return; // 連打対策：2度目以降の並行要求を無視
        loading = true;
        try {
          const res = await fetch('/api/singles', {
            headers: { 'Accept': 'application/json' }
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const data = await res.json();
          const singles = Array.isArray(data) ? data : [];

          // 万一の二重生成防止に念のため空にしてから構築
          list.replaceChildren();

          for (const single of singles) {
            const li = document.createElement('li');
            const a  = document.createElement('a');
            // number はURLパラメータになるので念のためエンコード
            a.href = '/calls/' + encodeURIComponent(single.number);
            a.textContent = `${single.number}枚目 ${single.name}`;
            li.appendChild(a);
            list.appendChild(li);
          }

          loaded = true;
          show(true); // 取得後に開く
          saveState(true);
          console.debug('[sidebar] fetched singles and opened list');
        } catch (err) {
          // 失敗時はメッセージを表示（アラートだけだとUXが悪いのでリスト内に表示）
          console.error('[sidebar] /api/singles fetch error:', err);
          list.replaceChildren();
          const li = document.createElement('li');
          li.textContent = '読み込みに失敗しました。時間をおいて再試行してください。';
          list.appendChild(li);
          show(true);
          saveState(true);
        } finally {
          loading = false;
        }
      } else {
        // 2回目以降は単に開閉
        const willOpen = list.classList.contains(HIDDEN);
        show(willOpen);
        saveState(willOpen);
        console.debug(`[sidebar] toggled list ${willOpen ? 'open' : 'close'}`);
      }
    });

    // 保存された状態を復元する
    let rememberedOpen = false;
    try {
      rememberedOpen = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      console.debug('[sidebar] failed to read state', e);
    }
    if (rememberedOpen) {
      console.debug('[sidebar] restoring open state');
      toggle.click();
    }
  });
})();
