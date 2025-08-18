// 円タメグラフ画面のフォーム管理とグラフ生成を行うスクリプト
(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const container   = document.getElementById('form-container');
    const addBtn      = document.getElementById('add-form');
    const removeBtn   = document.getElementById('remove-form');
    const generateBtn = document.getElementById('generate-chart');
    const canvas      = document.getElementById('entame-chart');
    const table       = document.getElementById('entame-table');
    const imageInput  = document.getElementById('center-image');
    let chart = null;
    let centerImage = null;

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

    // 円グラフを生成し、表を作成する
    const generateChart = () => {
      const labels = Array.from(container.querySelectorAll('.name')).map(i => i.value);
      const data   = Array.from(container.querySelectorAll('.percent')).map(i => Number(i.value));
      const colors = Array.from(container.querySelectorAll('.color')).map(i => i.value);
      if (chart) chart.destroy();
      const centerImagePlugin = {
        id: 'centerImage',
        afterDraw: (c) => {
          if (!centerImage) return;
          const ctx = c.ctx;
          const { left, top, width, height } = c.chartArea;
          const x = left + width / 2;
          const y = top + height / 2;
          const size = Math.min(width, height) * 0.5;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(centerImage, x - size / 2, y - size / 2, size, size);
          ctx.restore();
        }
      };
      chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ data: data, backgroundColor: colors }]
        },
        options: {
          cutout: '60%'
        },
        plugins: [centerImagePlugin]
      });
      table.innerHTML = '';
      labels.forEach((label, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="color-cell" style="background-color: ${colors[idx]};"></td>
          <td>${data[idx]}%</td>
          <td>${label}</td>
        `;
        table.appendChild(row);
      });
      console.log('[entame] doughnut chart and table generated');
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

    // 中央画像の読み込み
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        centerImage = new Image();
        centerImage.src = ev.target.result;
        centerImage.onload = () => {
          if (chart) chart.draw();
        };
        console.log('[entame] center image loaded');
      };
      reader.readAsDataURL(file);
    });

    // 初期表示としてフォームを1つ追加
    createRow();
  });
})();
