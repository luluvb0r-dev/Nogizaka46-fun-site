// 円タメグラフ画面のフォーム管理とグラフ生成を行うスクリプト
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const container   = document.getElementById('form-container');
    const addBtn      = document.getElementById('add-form');
    const removeBtn   = document.getElementById('remove-form');
    const generateBtn = document.getElementById('generate-chart');
    const canvas      = document.getElementById('entame-chart');
    let chart = null;

    // フォーム行を追加する関数
    const createRow = () => {
      const row = document.createElement('div');
      row.className = 'entame-row';
      row.innerHTML = `
        <input type="number" class="percent" min="1" max="100" placeholder="パーセント">
        <input type="text" class="name" placeholder="エンタメ名">
        <input type="color" class="color" value="#ff0000">
      `;
      container.appendChild(row);
      row.querySelector('.percent').addEventListener('input', updateState);
      updateState();
    };

    // 合計パーセントの計算とボタン活性化の管理
    const updateState = () => {
      const percents = Array.from(container.querySelectorAll('.percent'))
        .map(input => Number(input.value));
      const sum = percents.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
      generateBtn.disabled = sum !== 100;
    };

    // 円グラフを生成する
    const generateChart = () => {
      const labels = Array.from(container.querySelectorAll('.name')).map(i => i.value);
      const data   = Array.from(container.querySelectorAll('.percent')).map(i => Number(i.value));
      const colors = Array.from(container.querySelectorAll('.color')).map(i => i.value);
      if (chart) chart.destroy();
      chart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{ data: data, backgroundColor: colors }]
        }
      });
      console.log('[entame] pie chart generated');
    };

    // ボタンイベント設定
    addBtn.addEventListener('click', () => {
      console.log('[entame] add form');
      createRow();
    });

    removeBtn.addEventListener('click', () => {
      const rows = container.querySelectorAll('.entame-row');
      if (rows.length > 1) {
        rows[rows.length - 1].remove();
        console.log('[entame] remove form');
        updateState();
      }
    });

    generateBtn.addEventListener('click', generateChart);

    // 初期表示としてフォームを1つ追加
    createRow();
  });
})();
