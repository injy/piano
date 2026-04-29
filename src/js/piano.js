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

// 创建多声部合成器 (钢琴音色)
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: 'triangle'
  },
  envelope: {
    attack: 0.005,
    decay: 0.3,
    sustain: 0.1,
    release: 1.2
  }
}).toDestination();

// 设置音量
synth.volume.value = -6;

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

export const piano = () => {
  // 启动音频上下文 (用户交互后才能启动)
  document.addEventListener('click', () => {
    Tone.start();
  }, { once: true });

  addKeyboardEvents();
  addTapEvents();
};
