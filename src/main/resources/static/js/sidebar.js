// サイドバー「コール」開閉と初回のみ /api/releases を取得してリストを生成するスクリプト
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

    /**
     * サイドバー開閉状態を保存するキー
     * ページ遷移後も状態を維持するために使用する。
     */
    const STORAGE_KEY = 'sidebarOpen';
    const HIDDEN = 'hidden';

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
      // 状態を保存し、デバッグ用ログを出力する
      localStorage.setItem(STORAGE_KEY, visible ? 'true' : 'false');
      console.log('[sidebar] state:', visible ? 'open' : 'closed');
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
          const res = await fetch('/api/releases', {
            headers: { 'Accept': 'application/json' }
          });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const data = await res.json();
          const releases = Array.isArray(data) ? data : [];

          // 万一の二重生成防止に念のため空にしてから構築
          list.replaceChildren();

          for (const rel of releases) {
            const li = document.createElement('li');
            const a  = document.createElement('a');
            a.href = '#';
            const label = rel.category === 'Single' && rel.number
              ? `${rel.number}枚目 ${rel.title}`
              : rel.title;
            a.textContent = label;
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              const songsUl = li.querySelector('ul');
              const willOpen = songsUl.classList.contains(HIDDEN);
              songsUl.classList.toggle(HIDDEN, !willOpen);
              console.log('[sidebar] toggle songs for', label, willOpen ? 'open' : 'close');
            });
            li.appendChild(a);

            const songsUl = document.createElement('ul');
            songsUl.classList.add(HIDDEN);
            for (const song of rel.songs) {
              const sLi = document.createElement('li');
              const sA  = document.createElement('a');
              sA.href = '/song/' + encodeURIComponent(song);
              sA.textContent = song;
              sLi.appendChild(sA);
              songsUl.appendChild(sLi);
            }
            li.appendChild(songsUl);
            list.appendChild(li);
          }

          loaded = true;
          console.log('[sidebar] releases loaded:', releases.length);
          show(true); // 取得後に開く
        } catch (err) {
          // 失敗時はメッセージを表示（アラートだけだとUXが悪いのでリスト内に表示）
          console.error('[sidebar] /api/releases fetch error:', err);
          list.replaceChildren();
          const li = document.createElement('li');
          li.textContent = '読み込みに失敗しました。時間をおいて再試行してください。';
          list.appendChild(li);
          show(true);
        } finally {
          loading = false;
        }
      } else {
        // 2回目以降は単に開閉
        const willOpen = list.classList.contains(HIDDEN);
        show(willOpen);
      }
    });

    // 前回開いていた場合は自動で開く
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      console.log('[sidebar] restoring open state');
      toggle.click();
    }
  });
})();
