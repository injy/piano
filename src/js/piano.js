import * as Tone from 'tone';

// 音符到频率的映射 (MIDI note number to frequency)
const NOTE_FREQUENCIES = {
  '1C': 261.63,   // C4
  '1Cs': 277.18,  // C#4
  '1D': 293.66,   // D4
  '1Ds': 311.13,  // D#4
  '1E': 329.63,   // E4
  '1F': 349.23,   // F4
  '1Fs': 369.99,  // F#4
  '1G': 392.00,   // G4
  '1Gs': 415.30,  // G#4
  '2A': 440.00,   // A4
  '2As': 466.16,  // A#4
  '2B': 493.88,   // B4
  '2C': 523.25,   // C5
  '2Cs': 554.37,  // C#5
  '2D': 587.33,   // D5
  '2Ds': 622.25,  // D#5
  '2E': 659.25,   // E5
  '2F': 698.46,   // F5
  '2Fs': 739.99,  // F#5
  '2G': 783.99,   // G5
  '2Gs': 830.61,  // G#5
  '3A': 880.00,   // A5
  '3As': 932.33,  // A#5
  '3B': 987.77    // B5
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
  
  // 获取当前正在播放的音符
  const activeNotes = synth.activeVoices.map(v => v.note);
  
  // 释放当前音符
  synth.releaseAll();
  
  // 销毁旧合成器
  synth.dispose();
  
  // 创建新合成器
  currentSound = soundKey;
  synth = new Tone.PolySynth(Tone.Synth, SOUND_PRESETS[soundKey]).toDestination();
  synth.volume.value = -6;
  
  // 重新触发正在播放的音符
  if (activeNotes.length > 0) {
    synth.triggerAttack(activeNotes);
  }
  
  // 更新 UI
  document.querySelectorAll('.sound-selector button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sound === soundKey);
  });
  
  // 存储选择
  localStorage.setItem('piano-sound', soundKey);
}

/**
 * 横屏切换
 */
function toggleLandscape() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
    // 尝试强制横屏
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
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
  const selector = document.querySelector('.sound-selector');
  if (!selector) return;
  
  // 绑定点击事件
  selector.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSound(btn.dataset.sound);
    });
  });
  
  // 恢复保存的选择
  const savedSound = localStorage.getItem('piano-sound');
  if (savedSound && SOUND_PRESETS[savedSound]) {
    switchSound(savedSound);
  }
}

function initLandscapeButton() {
  const btn = document.querySelector('.landscape-btn');
  if (!btn) return;
  
  // 只在移动设备显示
  if (isMobile()) {
    btn.style.display = 'flex';
    btn.addEventListener('click', toggleLandscape);
  }
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
};
