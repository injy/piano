import * as Tone from 'tone';

// 音符到频率的映射 (MIDI note number to frequency)
// 简谱标记: 1=C, 2=D, 3=E, 4=F, 5=G, 6=A, 7=B
// 低音区(1x): 1x=C3, 2x=D3, 3x=E3, 4x=F3, 5x=G3, 6x=A3, 7x=B3
// 中音区(2x): 2x=C4, 3x=D4, 4x=E4, 5x=F4, 6x=G4, 7x=A4, 高音1=B4, 高音2=C5, 高音3=D5
const NOTE_FREQUENCIES = {
  '1C': 130.81,   // C3 - 低音1
  '1Cs': 138.59,  // C#3 - 低音#1
  '1D': 146.83,   // D3 - 低音2
  '1Ds': 155.56,  // D#3 - 低音#2
  '1E': 164.81,   // E3 - 低音3
  '1F': 174.61,   // F3 - 低音4
  '1Fs': 184.99,  // F#3 - 低音#4
  '1G': 196.00,   // G3 - 低音5
  '1Gs': 207.65,  // G#3 - 低音#5
  '1A': 220.00,   // A3 - 低音6
  '1As': 233.08,  // A#3 - 低音#6
  '1B': 246.94,   // B3 - 低音7
  '2C': 261.63,   // C4 - 中音1
  '2Cs': 277.18,  // C#4 - 中音#1
  '2D': 293.66,   // D4 - 中音2
  '2Ds': 311.13,  // D#4 - 中音#2
  '2E': 329.63,   // E4 - 中音3
  '2F': 349.23,   // F4 - 中音4
  '2Fs': 369.99,  // F#4 - 中音#4
  '2G': 392.00,   // G4 - 中音5
  '2Gs': 415.30,  // G#4 - 中音#5
  '2A': 440.00,   // A4 - 中音6
  '2As': 466.16,  // A#4 - 中音#6
  '2B': 493.88,   // B4 - 中音7
  '3C': 523.25,   // C5 - 高音1
  '3Cs': 554.37,  // C#5 - 高音#1
  '3D': 587.33,   // D5 - 高音2
  '3Ds': 622.25,  // D#5 - 高音#2
  '3E': 659.25,   // E5 - 高音3
  '3F': 698.46,   // F5 - 高音4
  '3Fs': 739.99,  // F#5 - 高音#4
  '3G': 783.99,   // G5 - 高音5
  '3Gs': 830.61,  // G#5 - 高音#5
  '3A': 880.00,   // A5 - 高音6
  '3As': 932.33,  // A#5 - 高音#6
  '3B': 987.77    // B5 - 高音7
};

// 音色配置
const SOUND_PRESETS = {
  pure: {
    name: '纯静',
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 }
  },
  soft: {
    name: '柔和',
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 1.2 }
  },
  electric: {
    name: '电子',
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.4, release: 0.3 }
  },
  orchestra: {
    name: '管弦',
    oscillator: { type: 'square' },
    envelope: { attack: 0.02, decay: 0.5, sustain: 0.3, release: 1.5 }
  }
};

// 当前音色
let currentSound = 'soft';

// 创建合成器
let synth = new Tone.PolySynth(Tone.Synth, SOUND_PRESETS[currentSound]).toDestination();
synth.volume.value = -6;

/**
 * 切换音色
 */
function switchSound(soundKey) {
  if (soundKey === currentSound) return;
  
  // 释放当前音符
  synth.releaseAll();
  
  // 销毁旧合成器
  synth.dispose();
  
  // 创建新合成器
  currentSound = soundKey;
  synth = new Tone.PolySynth(Tone.Synth, SOUND_PRESETS[soundKey]).toDestination();
  synth.volume.value = -6;
  
  // 更新 UI
  document.querySelectorAll('.sound-selector button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sound === soundKey);
  });
  
  // 存储选择
  localStorage.setItem('piano-sound', soundKey);
}

/**
 * 横屏切换 - 类似视频全屏
 * 直接切换 body 的 landscape-mode 类，不需要克隆 DOM
 */
function toggleLandscape() {
  const isLandscape = document.body.classList.toggle('landscape-mode');
  const container = document.getElementById('piano-container');
  
  // 更新所有横屏按钮的文字
  document.querySelectorAll('.landscape-btn .btn-text').forEach(btnText => {
    btnText.textContent = isLandscape ? '退出横屏' : '横屏';
  });
  
  if (isLandscape) {
    // 使用全屏 API（可选增强）
    tryFullscreen(container);
  } else {
    // 退出全屏
    exitFullscreen();
  }
}

/**
 * 尝试进入全屏
 */
function tryFullscreen(element) {
  if (element?.requestFullscreen) {
    element.requestFullscreen().catch(() => {});
  } else if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

/**
 * 退出全屏
 */
function exitFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

/**
 * Source: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
 */
function isTouchDevice() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function (query) {
    return window.matchMedia(query).matches;
  };
  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function addKeyboardEvents() {
  window.addEventListener('keydown', (e) => {
    const keyNo = e.which;
    const $key = document.querySelector(`[data-key='${keyNo}']`) || '';

    if ($key && !$key.classList.contains('active')) {
      const note = $key.getAttribute('data-note');
      synth.triggerAttack(NOTE_FREQUENCIES[note]);
      $key.classList.add('active');
    }
  });

  window.addEventListener('keyup', (e) => {
    const keyNo = e.which;
    const $key = document.querySelector(`[data-key='${keyNo}']`) || '';

    if ($key) {
      const note = $key.getAttribute('data-note');
      synth.triggerRelease(NOTE_FREQUENCIES[note]);
      $key.classList.remove('active');
    }
  });
}

function addTapEvents() {
  document.querySelectorAll('[data-key]').forEach((key) => {
    const note = key.getAttribute('data-note');

    const handler = {
      noteStart: null,
      handleEvent(e) {
        e.preventDefault();
        if (e.type === 'touchstart' || e.type === 'mousedown') {
          synth.triggerAttack(NOTE_FREQUENCIES[note]);
          key.classList.add('active');
          this.noteStart = Date.now();
        } else {
          synth.triggerRelease(NOTE_FREQUENCIES[note]);
          key.classList.remove('active');
        }
      }
    };

    if (isTouchDevice()) {
      key.addEventListener('touchstart', handler);
      key.addEventListener('touchend', handler);
    } else {
      key.addEventListener('mousedown', handler);
      key.addEventListener('mouseup', handler);
      key.addEventListener('mouseleave', handler);
    }
  });
}

function initSoundSelector() {
  // 绑定所有音色选择器（包括页面上的和横屏容器内的）
  document.querySelectorAll('.sound-selector').forEach(selector => {
    selector.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        switchSound(btn.dataset.sound);
      });
    });
  });
  
  // 恢复保存的选择
  const savedSound = localStorage.getItem('piano-sound');
  if (savedSound && SOUND_PRESETS[savedSound]) {
    switchSound(savedSound);
  }
}

function initLandscapeButton() {
  // 绑定所有横屏按钮
  document.querySelectorAll('.landscape-btn').forEach(btn => {
    btn.addEventListener('click', toggleLandscape);
  });
}

/**
 * 根据音符行数动态计算滚动时间
 * 每行滚动时间可配置
 */
function initScrollAnimation() {
  const content = document.querySelector('.sheet-music-content');
  if (!content) return;
  
  const rows = content.querySelectorAll('.note-row');
  const originalRowCount = rows.length;
  
  // 复制内容实现无限循环
  const rowsCopy = content.innerHTML;
  content.innerHTML = rowsCopy + rowsCopy;
  
  // 每行滚动时间（秒），可修改
  const rowDuration = 4;
  const duration = originalRowCount * rowDuration;
  
  // 设置动画持续时间
  content.style.animationDuration = `${duration}s`;
}

export const piano = () => {
  // 启动音频上下文 (用户交互后才能启动)
  document.addEventListener('click', () => {
    Tone.start();
  }, { once: true });

  addKeyboardEvents();
  addTapEvents();
  initSoundSelector();
  initLandscapeButton();
  initScrollAnimation();
};
