import { piano } from './js/piano';
import './app.styl';

// 横屏模式切换按钮
const landscapeBtn = document.querySelector('.landscape-btn');
const btnText = document.querySelector('.landscape-btn .btn-text');

landscapeBtn?.addEventListener('click', () => {
  const isLandscape = document.body.classList.toggle('landscape-mode');
  btnText.textContent = isLandscape ? '退出横屏' : '横屏';
});

piano();
