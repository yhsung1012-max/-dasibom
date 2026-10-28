import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// 1. 타입 정의 (TypeScript Interfaces)
// ============================================================================
export type AppMode = 'welcome' | 'mode_select' | 'caregiver_home' | 'elder_talk' | 'counseling' | 'report';

export interface DialogueMessage {
  id: string;
  sender: 'elder' | 'bomi' | 'system';
  text: string;
  timestamp: string;
  emotion?: 'calm' | 'happy' | 'nostalgic' | 'confused' | 'anxious';
  memoryAnchor?: string;
  audioPlaying?: boolean;
}

export interface SeniorProfile {
  name: string;
  birthdate: string;
  age: number;
  gender: 'female' | 'male';
  diagnosis: string;
  spouse: string;
  children: {
    first: { relation: string; age: number; note: string };
    second: { relation: string; age: number; note: string };
  };
  keyMemories: {
    year: string;
    title: string;
    description: string;
    imageUrl: string;
  }[];
}

export interface CounselingScenario {
  id: string;
  title: string;
  category: string;
  icon: string;
  caregiverQuery: {
    author: string;
    stage: string;
    time: string;
    question: string;
  };
  medicalCause: {
    title: string;
    explanation: string;
  };
  threeSteps: {
    stepA: { title: string; speech: string };
    stepB: { title: string; speech: string };
    stepC: { title: string; speech: string };
  };
  avoidActions: string[];
  escalationCriteria: string;
}

// ============================================================================
// 2. 에셋 및 나한희 어르신 프로필 데이터
// ============================================================================
const ASSETS = {
  naHanheeProfile: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZGFkMyIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmRmOWEiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9Ijc4IiByPSIzNiIgZmlsbD0iI2Y0YzliNSIvPgogIDxwYXRoIGQ9Ik02MCA3MCBDNjAgMzggMTQwIDM4IDE0MCA3MCBDMTMwIDUyIDcwIDUyIDYwIDcwIFoiIGZpbGw9IiNkOWQ0ZDAiLz4KICA8cGF0aCBkPSJNMzQgMjAwIEMzNCAxNDAgMTY2IDE0MCAxNjYgMjAwIFoiIGZpbGw9IiNlMjdiNjYiLz4KICA8Y2lyY2xlIGN4PSI4NiIgY3k9IjgwIiByPSIzLjUiIGZpbGw9IiM1NTQyM2YiLz4KICA8Y2lyY2xlIGN4PSIxMTQiIGN5PSI4MCIgcj0iMy41IiBmaWxsPSIjNTU0MjNmIi8+CiAgPHBhdGggZD0iTTg4IDk2IFExMDAgMTA2IDExMiA5NiIgc3Ryb2tlPSIjOWE0NDMyIiBzdHJva2Utd2lkdGg9IjMuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=',
  cherryBlossom1978: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8ILzB6zjt_HEyEDfAAOVjfhyKMN7JqfM7xYePLoHoFbOfpv5nRF-e4s5KvFFYVXd2_Fmh0JN14NGgqyBjCxKYMntVBFbv3FflKGWcVh2NPNCoeES_nJlXnbir6VcXE6y-Xj6Fjy0BTJ7HP5GxeJaVi1zrLojXYFjVMTcT5Go-CcPq5c-MHLHkrJ4U4qOzlXjcO-V4cT7sn4TqKzflvAA6adpEK4-LCPK1uqZtkKhkOl7H_JJHF_GE',
  doctorKim: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBA_Dw9zcN89b8Ps2_m7ddKaw8Zugjuo0SLCnxPeiidg4TAldebYT8icMkngjN5e4tcdMit8WLXZiZFqW5N8pu4LsbVqNcxjre1ybFq_tEXHdnfQ4VWT5xn_P0iP4obb7eZlRYv_aGw5ZH9Ig3HGCBwnz9amaeZ2loU-T1pCefi3alouhu8x588w-7m6XKpqgWnkU1QNKTaQgx-DR_1E3czY9wx9BJAVV9cbewzPWBkCdKiKei3S9Se',
  vintageAlbumTable: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx0K5ntn6_V5XVw28XhPjrW6YFl3L9d_FZqjCdwiTtQcKNsHJd9Uq1LNQM2jzYVtZujr4cYEOl_C5G4FFEQsZS868zcaugmNRkj_85EbWw4DJ6O-2gcEOPVcyo3oS6JYF_wplyaWKf3Bt84vXXwN8E9bpqlF4OnyA5PE3NafjQODG8T2x-5EBPKWYNp6ZqTlVTO-8iUrRzXGN-NjX5W6Q-A3Lw9Bbk5g9mOi4ige2ZqQ6ppOnj-Bbb',
};

const NA_HANHEE_PROFILE: SeniorProfile = {
  name: '나한희',
  birthdate: '1963년 8월 14일',
  age: 63,
  gender: 'female',
  diagnosis: '알츠하이머성 치매 (경도~중등도)',
  spouse: '한종철',
  children: {
    first: { relation: '첫째 딸', age: 32, note: '사업 성공, 든든한 지원군, 엄마와 맥심 화이트골드 커피 친구' },
    second: { relation: '둘째 아들', age: 24, note: '군 제대 후 복학 준비 중' },
  },
  keyMemories: [
    {
      year: '1978년',
      title: '창경원 벚꽃 나들이',
      description: '화사하게 핀 분홍빛 벚꽃 그늘 아래에서 가족과 함께 봄바람을 맞으시던 참 고운 날',
      imageUrl: ASSETS.cherryBlossom1978,
    },
    {
      year: '1983년',
      title: '과학중점대 밴드부 공연',
      description: '청춘의 열정으로 기타를 치며 노래 부르던 시절, 장발의 드러머 선배와 가장 즐겨 부르던 이문세의 "소녀"',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    },
    {
      year: '2023년',
      title: '딸의 깜짝 선물 (빨간 내복과 한우)',
      description: '사업에 성공한 딸아이가 빨간 내복 상자 뒤에 숨겨온 최고급 한우 세트로 온 가족이 웃음꽃을 피우며 구워 먹던 날',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
    {
      year: '2024년',
      title: '미국 동부 가족 해외여행',
      description: '뉴욕 맨해튼 옥상 스카이라인과 자유의 여신상 요트의 시원한 바닷바람, 타임스퀘어 지갑을 찾아준 친절한 경찰',
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

const INITIAL_DIALOGUES: DialogueMessage[] = [
  {
    id: 'msg-1',
    sender: 'bomi',
    text: '어르신, 사진 속에서 곱게 한복을 입고 활짝 웃고 계신 분이 한희 어르신이신가요?',
    timestamp: '오후 2:15',
    emotion: 'happy',
    memoryAnchor: '1978년 창경원 벚꽃 나들이',
  },
  {
    id: 'msg-2',
    sender: 'elder',
    text: '네, 맞아요. 그때 날이 참 따뜻해서 분홍빛 한복을 꺼내 입고 갔었지요.',
    timestamp: '오후 2:16',
    emotion: 'nostalgic',
  },
];

const COUNSELING_SCENARIOS: CounselingScenario[] = [
  {
    id: 'medication_refusal',
    title: '약 복용 거부 · 의심',
    category: '약 복용',
    icon: 'medication',
    caregiverQuery: {
      author: '이정민 보호자님 (딸)',
      stage: '치매 2단계',
      time: '오전 10:42',
      question: '어머니가 약을 이미 드셨는데도 자꾸 안 드셨다고 화를 내세요... 방금 드셨다고 사실대로 말씀드리면 더 언성을 높이시는데, 어떻게 말씀드려야 안심하시고 화를 가라앉히실까요?',
    },
    medicalCause: {
      title: '의학적 원인 이해: 해마의 일시적 인출 장애',
      explanation: '어머니는 고집을 부리시는 것이 아닙니다. 뇌의 해마가 약을 먹었다는 사건 자체를 기록하지 못해 "약 복용을 놓쳐 아플까 봐 극심한 불안감"을 느끼고 계신 상태입니다.',
    },
    threeSteps: {
      stepA: { title: '논쟁 멈추고 불안 감정 인정하기', speech: '엄마 건강 챙기시려고 약 시간 잊지 않고 계셨네요. 제가 얼른 챙겨드릴 테니 걱정 마세요.' },
      stepB: { title: '시각적 안심 대체 행동 (보리차/비타민)', speech: '속 쓰리지 않게 따뜻한 보리차 먼저 마셔요. 속이 편안해져야 약도 잘 듣는대요.' },
      stepC: { title: '달력 꽃 스티커 확인 루틴', speech: '어머, 우리 달력 볼까요? 오늘 예쁜 꽃 스티커 붙어있네요! 엄마가 아까 참 잘 드셨다는 표시예요.' },
    },
    avoidActions: ['“방금 드셨잖아요!”라며 논리적으로 따지기', '약봉지를 들이대며 증명하려 하기', '큰 소리로 감정적 대립하기'],
    escalationCriteria: '약 복용에 대한 의심과 공격성이 3일 이상 지속되거나 신체적 위험 행동이 나타날 경우 신경과 주치의 상담을 권장합니다.',
  },
  {
    id: 'meal_refusal',
    title: '식사 거부 대처법',
    category: '식사/영양',
    icon: 'restaurant',
    caregiverQuery: {
      author: '한종철 보호자님 (남편)',
      stage: '치매 2단계',
      time: '오후 1:15',
      question: '점심 밥상을 차려드렸는데 "방금 밥 잔뜩 먹었는데 왜 또 먹으라 하냐"며 숟가락을 밀어내십니다.',
    },
    medicalCause: {
      title: '의학적 원인 이해: 포만 중추 인지 착오',
      explanation: '시간 감각의 혼돈과 함께 위장 운동 저하로 배가 부르다고 착각하거나 삼키는 데 보이지 않는 통증이 있을 수 있습니다.',
    },
    threeSteps: {
      stepA: { title: '포만감 인정하며 부담 줄이기', speech: '배가 많이 부르셨군요. 다 안 드셔도 괜찮아요. 따뜻한 숭늉 한 모금만 축이실까요?' },
      stepB: { title: '추억의 기호 식품이나 간식 유도', speech: '한희 씨 좋아하시는 달콤한 고구마랑 따뜻한 우유 가져왔어요. 맛만 보실래요?' },
      stepC: { title: '함께 먹는 정서적 식탁 환경 조성', speech: '제가 끓인 국이 너무 맛있는데, 한 숟가락만 간 좀 봐주시겠어요?' },
    },
    avoidActions: ['억지로 숟가락 쥐여주기', '화를 내며 밥상 치우기'],
    escalationCriteria: '음식 섭취 거부가 48시간 이상 지속될 경우 탈수 위험이 있으므로 수액 상담이 필요합니다.',
  },
  {
    id: 'repetitive_questions',
    title: '같은 질문 반복',
    category: '기억/질문',
    icon: 'replay',
    caregiverQuery: {
      author: '한지수 보호자님 (딸)',
      stage: '치매 2단계',
      time: '오후 4:20',
      question: '5분 간격으로 "집에 언제 가니?"라고 계속 물어보세요. 지치지 않고 대화하는 팁이 있을까요?',
    },
    medicalCause: {
      title: '의학적 원인 이해: 단기기억 휘발에 따른 불안감',
      explanation: '방금 들은 대답이 저장되지 않아 매 순간 새로운 불안이 엄습하는 상태입니다. "지금 내가 안전한지"를 확인하고 싶어 하십니다.',
    },
    threeSteps: {
      stepA: { title: '불안한 마음 안심시키기', speech: '편안한 곳에 있고 싶으시군요. 엄마가 계신 여기가 가장 안전한 우리 집이에요.' },
      stepB: { title: '매번 처음 듣는 것처럼 다정하게 답하기', speech: '오늘 일정은 다 끝났어요. 이제 저랑 따뜻한 차 한잔 마시면서 쉬면 돼요.' },
      stepC: { title: '좋아하시는 노래나 사진으로 주의 전환', speech: '엄마, 우리 대학 때 기타 치던 사진 볼까요? 이문세 노래 틀어드릴게요.' },
    },
    avoidActions: ['“아까 열 번도 넘게 말씀드렸잖아요!”라며 면박 주기', '“여기가 집인데 어디 가요?”라며 지적하기'],
    escalationCriteria: '반복 질문에 더해 극도의 공포나 야간 배회 충동이 결합될 경우 즉시 가족 및 방문케어 지원을 요청하세요.',
  },
  {
    id: 'sundowning_delirium',
    title: '수면 불안 및 야간 배회/섬망',
    category: '수면/배회',
    icon: 'bedtime',
    caregiverQuery: {
      author: '이정민 보호자님 (딸)',
      stage: '치매 2단계',
      time: '오후 8:50',
      question: '해가 지면 안절부절못하시며 밤중에 갑자기 "회사 가야 해", "엄마 병원 가야 해"라며 나가려 하십니다.',
    },
    medicalCause: {
      title: '의학적 원인 이해: 석양 증후군(Sundowning)',
      explanation: '해질녘 빛 감소와 일주기 리듬 교란으로 뇌 기능이 저하되어 30대 직장 생활이나 어머니에 대한 그리움이 현실로 튀어나오는 현상입니다.',
    },
    threeSteps: {
      stepA: { title: '어머니 그리움과 책임감 공감하기', speech: '우리 엄마, 외할머니 생각이 많이 나셨군요. 할머니 챙기시느라 평생 애쓰셨지요.' },
      stepB: { title: '자연스러운 시간적 유예와 안전 보장', speech: '지금은 밤이 늦어 문이 닫혔어요. 내일 아침 해 뜨면 따뜻한 차 챙겨서 가요.' },
      stepC: { title: '조명 밝히고 조용한 음악으로 안정 유도', speech: '제가 곁에서 손 꼭 잡고 있을게요. 엄마 좋아하시는 따뜻한 이불 덮어드릴게요.' },
    },
    avoidActions: ['“외할머니 돌아가신 지가 언젠데요!”라며 현실 직격탄 날리기', '신체적으로 억압하거나 문 잠그기'],
    escalationCriteria: '현관문을 열고 밖으로 나가거나 밤샘 각성이 3일 이상 지속되면 수면제 및 섬망 진료가 필요합니다.',
  },
];

// ============================================================================
// 3. 다정 음성 합성 엔진 (Neural AI TTS + Web Speech Fallback)
// ============================================================================
class GentleSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking = false;
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const koreanVoices = voices.filter((v) => v.lang.includes('ko') || v.lang.includes('KO'));
    this.selectedVoice =
      koreanVoices.find((v) => v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) ||
      koreanVoices.find((v) => v.name.includes('Google') || v.name.includes('SunHi') || v.name.includes('Yuna')) ||
      koreanVoices[0] ||
      null;
  }

  private playGentleChime(): void {
    try {
      if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) this.audioContext = new AudioContextClass();
      }
      if (!this.audioContext) return;
      const ctx = this.audioContext;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(739.99, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  public async speak(
    text: string,
    options: { slowMode?: boolean; onStart?: () => void; onEnd?: () => void; useNeuralTTS?: boolean } = {}
  ): Promise<void> {
    this.stop();
    const cleanText = text.replace(/["'“”‘’]/g, '').replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim();
    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    this.isSpeaking = true;
    options.onStart?.();
    this.playGentleChime();

    // 서버 뉴럴 AI TTS 우선 시도
    if (options.useNeuralTTS !== false) {
      try {
        this.abortController = new AbortController();
        const timeoutId = setTimeout(() => this.abortController?.abort(), 5000);

        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, slowMode: options.slowMode, voice: 'Kore' }),
          signal: this.abortController.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.audio) {
            const audio = new Audio(data.audio);
            this.currentAudio = audio;
            if (options.slowMode) audio.playbackRate = 0.9;
            audio.onended = () => {
              this.isSpeaking = false;
              this.currentAudio = null;
              options.onEnd?.();
            };
            audio.onerror = () => this.fallbackWebSpeech(cleanText, options);
            await audio.play();
            return;
          }
        }
      } catch (err) {}
    }

    this.fallbackWebSpeech(cleanText, options);
  }

  private fallbackWebSpeech(text: string, options: { slowMode?: boolean; onStart?: () => void; onEnd?: () => void }) {
    if (!this.synth) {
      this.isSpeaking = false;
      options.onEnd?.();
      return;
    }

    const polishedText = text.replace(/\./g, '... ').replace(/\?/g, '? ').replace(/,/g, ', ');
    const utterance = new SpeechSynthesisUtterance(polishedText);
    if (!this.selectedVoice) this.loadVoices();
    if (this.selectedVoice) utterance.voice = this.selectedVoice;

    utterance.lang = 'ko-KR';
    utterance.rate = options.slowMode ? 0.76 : 0.88;
    utterance.pitch = 0.96;
    utterance.volume = 1.0;

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => {
      this.isSpeaking = false;
      options.onEnd?.();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      options.onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.synth) this.synth.cancel();
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

const gentleSpeech = new GentleSpeechEngine();

// ============================================================================
// 4. 다시 봄 전용 벡터 꽃잎 로고 컴포넌트
// ============================================================================
const ReSpringLogo: React.FC<{ className?: string; size?: number | string }> = ({
  className = 'w-full h-full',
  size,
}) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="다시 봄 꽃잎 심볼 로고"
  >
    <defs>
      <linearGradient id="logoLeftPetal" x1="25%" y1="0%" x2="75%" y2="100%">
        <stop offset="0%" stopColor="#FF7A95" />
        <stop offset="45%" stopColor="#FF4A70" />
        <stop offset="100%" stopColor="#DC2650" />
      </linearGradient>
      <linearGradient id="logoRightPetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFBE7B" />
        <stop offset="40%" stopColor="#FF9060" />
        <stop offset="100%" stopColor="#ED5545" />
      </linearGradient>
      <linearGradient id="logoCenterDepth" x1="40%" y1="10%" x2="60%" y2="90%">
        <stop offset="0%" stopColor="#FF4A70" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#BE185D" stopOpacity="0.8" />
      </linearGradient>
      <filter id="logoDropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#9a4432" floodOpacity="0.16" />
      </filter>
    </defs>
    <g filter="url(#logoDropShadow)">
      <path
        d="M102 148 C108 140 128 110 148 94 C168 78 178 54 165 38 C152 22 128 26 112 42 C98 56 94 76 96 98 C97 114 99 136 102 148 Z"
        fill="url(#logoRightPetal)"
      />
      <path
        d="M100 152 C96 142 82 118 64 100 C44 80 22 66 32 46 C42 26 70 34 88 56 C102 74 104 98 102 122 C101 134 100 146 100 152 Z"
        fill="url(#logoLeftPetal)"
      />
      <path
        d="M100 152 C98 138 95 116 88 98 C82 82 74 72 78 64 C82 56 94 62 102 78 C108 90 106 114 104 134 C103 144 101 150 100 152 Z"
        fill="url(#logoCenterDepth)"
        opacity="0.75"
      />
      <path
        d="M99 154 C98 148 97 138 98 130 C99 122 102 116 103 116 C104 116 104 124 103 134 C102 144 101 151 99 154 Z"
        fill="#FFF4F2"
        opacity="0.65"
      />
    </g>
  </svg>
);

// ============================================================================
// 5. 나한희 어르신 프로필 및 인생 이야기 모달
// ============================================================================
const SeniorProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#fff8f5] rounded-3xl p-6 shadow-2xl border border-[#f1e6e0] text-[#201b17] no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f1e6e0] hover:bg-[#ece0da] flex items-center justify-center text-[#55423f] transition-colors"
          aria-label="닫기"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md ring-4 ring-[#ffdad3]">
              <img src={ASSETS.naHanheeProfile} alt="나한희 어르신 프로필" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-[#9a4432] text-white text-[11px] font-bold shadow">
              만 63세
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-[#201b17]">{NA_HANHEE_PROFILE.name} 어르신</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad3] text-[#7c2d1e] text-xs font-semibold">
              {NA_HANHEE_PROFILE.diagnosis}
            </span>
          </div>
          <p className="text-sm text-[#55423f] mt-1">
            {NA_HANHEE_PROFILE.birthdate} (경기도 출생) · 배우자 {NA_HANHEE_PROFILE.spouse}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f7ece5]">
            <h4 className="font-bold text-[#9a4432] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">family_restroom</span>
              가족 관계
            </h4>
            <div className="space-y-2 text-[#55423f]">
              <div><strong className="text-[#201b17]">첫째 딸 (32세):</strong> 사업 성공, 든든한 지원군, 엄마와 맥심 커피 친구</div>
              <div><strong className="text-[#201b17]">둘째 아들 (24세):</strong> 군 제대 후 복학 준비 중</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#f7ece5]">
            <h4 className="font-bold text-[#785a00] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">auto_stories</span>
              인생 스토리 &amp; 소중한 기억
            </h4>
            <ul className="space-y-2 text-xs text-[#55423f] leading-relaxed">
              <li><strong className="text-[#201b17]">1983년 (20세):</strong> 과학중점대 입학 및 대학 밴드부 활동, 애창곡 이문세 &apos;소녀&apos;</li>
              <li><strong className="text-[#201b17]">1987~1997년:</strong> IT 개발자 재직, IMF 야근으로 커피 애호 습관</li>
              <li><strong className="text-[#201b17]">2022년:</strong> 정신적 지주였던 어머니의 별세 (애틋한 그리움)</li>
              <li><strong className="text-[#201b17]">2023년:</strong> 딸의 사업 성공 기념 깜짝 선물 (빨간 내복과 한우 파티)</li>
              <li><strong className="text-[#201b17]">2024년:</strong> 미국 동부 가족 여행 (뉴욕 타임스퀘어 지갑 찾음, 자유의 여신상 요트)</li>
            </ul>
          </div>

          <div className="bg-[#fdf1eb] rounded-2xl p-4 border border-[#ffdad3]">
            <h4 className="font-bold text-[#ba1a1a] mb-2 flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-base">vital_signs</span>
              보호자 및 AI 케어 핵심 주의사항
            </h4>
            <ul className="text-xs space-y-1.5 text-[#55423f]">
              <li>• 저녁 7시 이후 석양증후군으로 일시적 방향/시간 혼동이 올 수 있습니다.</li>
              <li>• 약을 이미 드셨는데 안 드셨다고 하실 때는 논쟁하지 말고 보리차로 안심시킵니다.</li>
              <li>• 밤에 깨어나 "회사 가야 해" 하실 때는 따뜻하게 공감 후 내일 가자고 유예합니다.</li>
              <li>• 좋아하는 밴드부 음악(소녀)이나 딸과의 커피 추억을 건네면 빠르게 안정을 찾으십니다.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3.5 rounded-full bg-[#9a4432] text-white font-semibold text-sm shadow hover:bg-[#7c2d1e] active:scale-98 transition-all"
        >
          확인 및 닫기
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 6. 상단 헤더 & 하단 내비게이션
// ============================================================================
const Header: React.FC<{ subtitle: string; onProfileClick: () => void; onHomeClick?: () => void }> = ({
  subtitle,
  onProfileClick,
  onHomeClick,
}) => (
  <header className="fixed top-0 inset-x-0 z-40 bg-[#fff8f5]/85 backdrop-blur-xl border-b border-[#f1e6e0]/60 shadow-[0_1px_8px_rgba(92,58,33,0.04)]">
    <div className="max-w-md mx-auto h-16 px-4 flex items-center justify-between">
      <button onClick={onHomeClick} className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer">
        <div className="w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-105">
          <ReSpringLogo className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold text-[#9a4432] tracking-tight">다시 봄</span>
          <span className="text-xs text-[#55423f] font-medium px-2 py-0.5 rounded-full bg-[#f7ece5]">{subtitle}</span>
        </div>
      </button>

      <button
        onClick={onProfileClick}
        className="relative flex items-center gap-1.5 p-1 rounded-full hover:bg-[#f7ece5] transition-all focus:outline-none active:scale-95 group cursor-pointer"
        title="나한희 어르신 프로필 및 생애사 보기"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-2 ring-[#ffdad3] group-hover:ring-[#9a4432] transition-colors">
          <img src={ASSETS.naHanheeProfile} alt="나한희 어르신 프로필" className="w-full h-full object-cover" />
        </div>
        <span className="hidden sm:inline text-xs font-semibold text-[#55423f] pr-1">나한희 님</span>
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#785a00] border-2 border-[#fff8f5] rounded-full"></span>
      </button>
    </div>
  </header>
);

const Navigation: React.FC<{ currentMode: AppMode; onSelectMode: (mode: AppMode) => void }> = ({
  currentMode,
  onSelectMode,
}) => {
  if (currentMode === 'welcome' || currentMode === 'mode_select') return null;

  const navItems = [
    { mode: 'caregiver_home' as AppMode, label: '홈', icon: 'cottage' },
    { mode: 'elder_talk' as AppMode, label: '어르신 대화', icon: 'record_voice_over' },
    { mode: 'counseling' as AppMode, label: '상담실', icon: 'support_agent' },
    { mode: 'report' as AppMode, label: '분석 보고서', icon: 'analytics' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#fff8f5]/90 backdrop-blur-xl border-t border-[#f1e6e0] shadow-[0_-2px_12px_rgba(92,58,33,0.05)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onSelectMode(item.mode)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[56px] min-w-[56px] px-2 transition-all cursor-pointer ${
                isActive ? 'text-[#9a4432] font-bold scale-105' : 'text-[#55423f] hover:text-[#201b17] font-medium'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-current' : ''}`}>
                {item.icon}
              </span>
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ============================================================================
// 7. 화면 컴포넌트들
// ============================================================================

// [화면 1] 스플래시 인트로 화면
const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="relative min-h-screen w-full max-w-md mx-auto flex flex-col justify-between items-center px-5 py-8 overflow-hidden bg-[#fff8f5] text-[#201b17]">
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#ffdad3]/40 blur-3xl pointer-events-none"></div>
    <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-[#ffdf9a]/40 blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-20 -left-16 w-72 h-72 rounded-full bg-[#ffdbd0]/30 blur-3xl pointer-events-none"></div>

    <div className="relative z-10 pt-4">
      <div className="inline-flex items-center gap-1.5 bg-[#f7ece5] px-4 py-1.5 rounded-full shadow-sm">
        <span className="material-symbols-outlined text-[#9a4432] text-[18px]">spa</span>
        <span className="text-xs font-semibold text-[#55423f]">마음 안심 돌봄 공간</span>
      </div>
    </div>

    <div className="relative z-10 flex flex-col items-center w-full max-w-sm my-auto text-center">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-56 h-56 rounded-full bg-[#ffb4a5]/20 animate-pulse"></div>
        <div className="absolute w-44 h-44 rounded-full bg-[#fdf1eb] shadow-sm"></div>
        <div className="relative w-36 h-36 rounded-full bg-white flex items-center justify-center shadow-md p-4 transition-transform hover:scale-105 active:scale-95 duration-300">
          <ReSpringLogo className="w-full h-full object-contain filter drop-shadow-sm select-none" />
        </div>
      </div>

      <div className="space-y-1 mb-2">
        <h1 className="text-3xl font-bold text-[#201b17] tracking-tight">다시 봄</h1>
        <p className="text-sm text-[#9a4432] tracking-widest font-semibold uppercase">RE : SPRING</p>
      </div>

      <div className="bg-[#fdf1eb] px-6 py-3 rounded-2xl max-w-xs shadow-sm mt-2 border border-[#f1e6e0]">
        <p className="text-sm text-[#55423f] leading-relaxed break-keep">
          기억과 마음을 다정하게 잇는<br />봄날의 따뜻한 동반자
        </p>
      </div>
    </div>

    <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4 mt-6">
      <button
        onClick={onStart}
        className="group relative w-full min-h-[56px] bg-[#e27b66] hover:bg-[#9a4432] active:scale-[0.98] transition-all rounded-full flex items-center justify-center px-6 shadow-lg shadow-[#e27b66]/20 text-white cursor-pointer"
      >
        <span className="material-symbols-outlined text-[24px] mr-2">touch_app</span>
        <span className="text-base font-semibold">화면을 터치하여 시작하기</span>
      </button>
      <div className="flex items-center gap-2 text-[#55423f]/70">
        <span className="inline-block w-2 h-2 rounded-full bg-[#e27b66] animate-ping"></span>
        <span className="text-xs text-[#88726e]">따스한 햇살처럼 온전히 연결 중</span>
      </div>
      <p className="text-xs text-[#dbc1bb] font-medium text-center pb-2">치매 어르신과 가족을 위한 AI 감성 케어 솔루션</p>
    </div>
  </div>
);

// [화면 2] 모드 선택 화면
const ModeSelectScreen: React.FC<{ onSelect: (mode: AppMode) => void }> = ({ onSelect }) => (
  <div className="relative min-h-screen w-full max-w-md mx-auto flex flex-col px-5 py-6 bg-[#fff8f5] text-[#201b17]">
    <header className="flex flex-col items-center text-center mt-2 mb-6">
      <div className="relative w-16 h-16 mb-2 rounded-full bg-[#fdf1eb] flex items-center justify-center shadow-sm border border-[#f1e6e0]">
        <ReSpringLogo className="w-11 h-11 object-contain" />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1e6e0] text-[#55423f] text-xs font-semibold mb-2">
        <span className="material-symbols-outlined text-sm text-[#9a4432]">family_star</span>
        <span>모드 맞춤 선택</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#201b17] tracking-tight">누가 사용하시나요?</h1>
      <p className="text-sm text-[#55423f] mt-1">편안한 맞춤 모드를 준비해 드릴게요</p>
    </header>

    <section className="flex flex-col gap-5 w-full flex-1">
      <article className="relative flex flex-col bg-white rounded-3xl p-6 shadow-sm border border-[#f7ece5] hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 shrink-0 rounded-full bg-[#ffdad3] flex items-center justify-center text-[#9a4432] shadow-sm">
            <span className="material-symbols-outlined text-3xl">face_6</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad3] text-[#3e0400] text-xs font-bold">어르신용</span>
              <span className="text-xs font-semibold text-[#9a4432] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">volume_up</span> 음성 특화
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#201b17] mt-1 truncate">정다운 이야기 모드</h2>
          </div>
        </div>
        <p className="text-sm text-[#55423f] mt-4 mb-4 leading-relaxed">
          큰 글씨와 따뜻한 목소리로 AI 봄이와 옛 사진과 소중한 추억을 이야기해요.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="flex items-center gap-2 bg-[#fdf1eb] px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[#9a4432] text-lg">record_voice_over</span>
            <span className="text-xs font-semibold text-[#201b17] truncate">쉬운 음성 대화</span>
          </div>
          <div className="flex items-center gap-2 bg-[#fdf1eb] px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[#9a4432] text-lg">photo_album</span>
            <span className="text-xs font-semibold text-[#201b17] truncate">추억 앨범 회상</span>
          </div>
        </div>
        <button
          onClick={() => onSelect('elder_talk')}
          className="w-full min-h-[52px] bg-[#e27b66] hover:bg-[#9a4432] active:scale-[0.98] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>어르신 모드로 시작하기</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </article>

      <article className="relative flex flex-col bg-white rounded-3xl p-6 shadow-sm border border-[#f7ece5] hover:shadow-md transition-all overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 shrink-0 rounded-full bg-[#ffdf9a] flex items-center justify-center text-[#5a4300] shadow-sm">
            <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdf9a] text-[#251a00] text-xs font-bold">가족 및 보호자용</span>
              <span className="text-xs font-semibold text-[#785a00] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-xs">shield</span> 안심 동행
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#201b17] mt-1 truncate">안심 케어 모드</h2>
          </div>
        </div>
        <p className="text-sm text-[#55423f] mt-4 mb-4 leading-relaxed">
          보호자 마음 상담실과 어르신 대화 분석 보고서를 한눈에 확인해요.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="flex items-center gap-2 bg-[#fdf1eb] px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[#785a00] text-lg">psychology</span>
            <span className="text-xs font-semibold text-[#201b17] truncate">마음 치유 상담</span>
          </div>
          <div className="flex items-center gap-2 bg-[#fdf1eb] px-3 py-2 rounded-xl">
            <span className="material-symbols-outlined text-[#785a00] text-lg">insights</span>
            <span className="text-xs font-semibold text-[#201b17] truncate">어르신 일상 리포트</span>
          </div>
        </div>
        <button
          onClick={() => onSelect('caregiver_home')}
          className="w-full min-h-[52px] bg-[#fdc425] hover:bg-[#f7be1d] active:scale-[0.98] text-[#251a00] font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <span>보호자 모드로 시작하기</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </article>
    </section>

    <footer className="flex items-center justify-center gap-2 mt-6 pb-2 text-center text-[#55423f]">
      <span className="material-symbols-outlined text-base">sync_alt</span>
      <p className="text-xs">언제든 설정에서 모드를 변경할 수 있어요</p>
    </footer>
  </div>
);

// [화면 3] 보호자 안심 홈
const CaregiverHomeScreen: React.FC<{ onNavigate: (mode: AppMode) => void; onOpenSeniorProfile: () => void }> = ({
  onNavigate,
  onOpenSeniorProfile,
}) => (
  <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-28 gap-5">
    <div className="relative overflow-hidden bg-white rounded-3xl p-5 shadow-sm border border-[#f1e6e0]">
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#fdf1eb] flex items-center justify-center p-2.5 shadow-sm overflow-hidden flex-shrink-0 border border-[#f1e6e0]">
            <ReSpringLogo className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="inline-flex items-center gap-1 text-[#785a00] text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              보호자 안심 홈
            </span>
            <h2 className="text-xl font-bold text-[#201b17] truncate mt-0.5">보호자 김민서 님</h2>
          </div>
        </div>

        <button
          onClick={onOpenSeniorProfile}
          className="relative flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-[#fdf1eb] border border-[#ffdad3] hover:bg-[#ffdad3]/50 transition-all cursor-pointer group"
          title="나한희 어르신 프로필 및 정보 보기"
        >
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#88726e]">돌봄 어르신</span>
            <span className="text-xs font-bold text-[#9a4432]">나한희 님</span>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#ffdad3] group-hover:ring-[#9a4432] transition-colors flex-shrink-0">
            <img src={ASSETS.naHanheeProfile} alt="나한희 어르신 프로필" className="w-full h-full object-cover rounded-full" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
          </div>
        </button>
      </div>

      <p className="text-xs sm:text-sm text-[#55423f] mt-3 leading-relaxed">
        오늘도 사랑과 헌신으로 채워진 평온한 하루를 온 마음으로 응원합니다.
      </p>

      <div className="mt-3 pt-3 border-t border-[#f7ece5] flex items-center justify-between text-xs text-[#55423f]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fdc425] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#fdc425]"></span>
          </span>
          <span className="font-medium">나한희 어르신 안심 케어 연동 중</span>
        </div>
        <span className="text-[#835244] font-medium">최근 대화: 방금 전</span>
      </div>
    </div>

    <div className="flex items-center justify-between px-1">
      <div>
        <h3 className="text-lg font-bold text-[#201b17]">케어 지원 모드 선택</h3>
        <p className="text-xs text-[#55423f]">원하시는 맞춤 케어 공간으로 바로 이동해보세요.</p>
      </div>
      <span className="material-symbols-outlined text-[#88726e] text-[22px]">tune</span>
    </div>

    <div className="flex flex-col gap-4">
      {/* 모드 1: 보호자 마음 상담실 */}
      <div className="group relative overflow-hidden bg-white rounded-3xl p-5 shadow-sm border border-[#f7ece5] hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdf9a] flex items-center justify-center text-[#251a00] shadow-sm">
              <span className="material-symbols-outlined text-[26px]">support_agent</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-[#785a00]">마음 회복 &amp; 전문 솔루션</span>
              <h4 className="text-lg font-bold text-[#201b17]">보호자 마음 상담실</h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#fdf1eb] text-[#5a4300] text-[11px] font-semibold">전문 케어</span>
        </div>
        <p className="text-xs sm:text-sm text-[#55423f] mb-3 leading-relaxed">
          돌봄의 지친 마음을 따뜻하게 나누고, 치매 증상 대처법과 전문의 상담을 안전하게 받으세요.
        </p>
        <button
          onClick={() => onNavigate('counseling')}
          className="w-full min-h-[50px] rounded-full bg-[#ffdf9a] hover:bg-[#f7be1d] text-[#251a00] font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
        >
          <span>상담실 입장하기</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      {/* 모드 2: 대화 분석 보고서 */}
      <div className="group relative overflow-hidden bg-white rounded-3xl p-5 shadow-sm border border-[#f7ece5] hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdad3] flex items-center justify-center text-[#7c2d1e] shadow-sm">
              <span className="material-symbols-outlined text-[26px]">monitoring</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-[#9a4432]">AI 인지 상태 리포트</span>
              <h4 className="text-lg font-bold text-[#201b17]">대화 분석 보고서</h4>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#fdf1eb] text-[#7c2d1e] text-[11px] font-semibold">주간 업데이트</span>
        </div>
        <p className="text-xs sm:text-sm text-[#55423f] mb-3 leading-relaxed">
          어르신이 나누신 일상 대화 속 단어 빈도, 기억 회상 안정도, 긍정 감정 변화를 다각도로 분석합니다.
        </p>
        <button
          onClick={() => onNavigate('report')}
          className="w-full min-h-[50px] rounded-full bg-[#9a4432] hover:bg-[#7c2d1e] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
        >
          <span>보고서 확인하기</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>

    {/* 24시간 긴급전화 */}
    <div className="bg-[#fdf1eb] rounded-2xl p-4 flex items-center justify-between gap-3 border border-[#f1e6e0]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-[#ece0da] flex items-center justify-center text-[#835244] flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]">emergency</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-[#55423f]">24시간 치매안심센터 긴급상담</span>
          <span className="text-base font-bold text-[#201b17] tracking-wide">1899-9988</span>
        </div>
      </div>
      <a
        href="tel:18999988"
        className="flex-shrink-0 px-3.5 py-2 rounded-full bg-white text-[#201b17] text-xs font-bold flex items-center gap-1 shadow-sm border border-[#f1e6e0] active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-[16px] text-[#835244]">call</span>
        <span>전화걸기</span>
      </a>
    </div>

    <div className="flex flex-col items-center justify-center pt-2">
      <button
        onClick={() => onNavigate('elder_talk')}
        className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-white hover:bg-[#f7ece5] transition-colors text-[#201b17] border border-[#f1e6e0] shadow-sm cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px] text-[#9a4432]">record_voice_over</span>
        <span className="text-sm font-bold">어르신 대화 모드로 전환하기</span>
        <span className="material-symbols-outlined text-[18px] text-[#88726e]">chevron_right</span>
      </button>
    </div>
  </div>
);

// [화면 4] 어르신 대화 모드
const ElderTalkScreen: React.FC<{
  dialogues: DialogueMessage[];
  onAddMessage: (msg: DialogueMessage) => void;
  onNavigateHome: () => void;
}> = ({ dialogues, onAddMessage, onNavigateHome }) => {
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [useNeuralVoice, setUseNeuralVoice] = useState(true);
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);

  const dialogueEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const currentMemory = NA_HANHEE_PROFILE.keyMemories[activeMemoryIndex];

  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogues, isLoadingReply]);

  useEffect(() => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (text) handleSendMessage(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      gentleSpeech.stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  const handleToggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { setIsListening(false); }
      } else {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          handleSendMessage('참 좋았지요, 봄이 생각하니 마음이 포근해요.');
        }, 800);
      }
    }
  };

  const handlePlayVoice = (id: string, text: string) => {
    if (currentlyPlayingId === id && gentleSpeech.getIsSpeaking()) {
      gentleSpeech.stop();
      setCurrentlyPlayingId(null);
      setAudioLoadingId(null);
      return;
    }

    setAudioLoadingId(id);
    gentleSpeech.speak(text, {
      slowMode: isSlowMode,
      useNeuralTTS: useNeuralVoice,
      onStart: () => {
        setAudioLoadingId(null);
        setCurrentlyPlayingId(id);
      },
      onEnd: () => {
        setAudioLoadingId(null);
        setCurrentlyPlayingId(null);
      },
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoadingReply) return;

    const newElderMsg: DialogueMessage = {
      id: `msg-${Date.now()}`,
      sender: 'elder',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      emotion: 'calm',
    };

    onAddMessage(newElderMsg);
    setInputText('');
    setIsLoadingReply(true);

    try {
      const res = await fetch('/api/chat/elder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history: [...dialogues, newElderMsg] }),
      });

      const data = await res.json();
      const replyText = data.text || '어르신 말씀을 들으니 제 마음도 참 따뜻해집니다.';

      const bomiMsg: DialogueMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bomi',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        emotion: data.emotion || 'happy',
      };

      onAddMessage(bomiMsg);
      handlePlayVoice(bomiMsg.id, replyText);
    } catch (err) {
      const fallbackMsg: DialogueMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bomi',
        text: '그 시절 이야기 들려주셔서 고마워요. 한희 어르신과 나누는 이 시간이 참 소중해요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        emotion: 'calm',
      };
      onAddMessage(fallbackMsg);
      handlePlayVoice(fallbackMsg.id, fallbackMsg.text);
    } finally {
      setIsLoadingReply(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pt-20 pb-28">
      <section className="px-4 pt-1 pb-3">
        <div className="bg-[#fdf1eb] rounded-3xl p-4 shadow-sm border border-[#f1e6e0] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ffdad3] flex items-center justify-center text-[#9a4432]">
                <span className="material-symbols-outlined text-[20px]">spa</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#201b17]">봄이와 도란도란 이야기 나누기</h2>
                <p className="text-xs text-[#55423f]">햇살처럼 포근한 기억을 떠올려보아요</p>
              </div>
            </div>
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-[#55423f] text-xs font-semibold shadow-sm border border-[#f1e6e0]"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>보호자 화면</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f1e6e0]/60">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-[#9a4432] animate-pulse"></span>
              <span className="text-xs text-[#9a4432] font-bold">봄이가 귀 기울여 듣고 있어요</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setUseNeuralVoice(!useNeuralVoice)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold shadow-sm cursor-pointer ${
                  useNeuralVoice ? 'bg-[#ffdad3] text-[#7c2d1e]' : 'bg-white text-[#55423f] border border-[#f1e6e0]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#9a4432]">auto_awesome</span>
                <span>{useNeuralVoice ? '다정 AI 음성' : '기본 음성'}</span>
              </button>
              <button
                onClick={() => setIsSlowMode(!isSlowMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold shadow-sm cursor-pointer ${
                  isSlowMode ? 'bg-[#9a4432] text-white' : 'bg-white text-[#55423f] border border-[#f1e6e0]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">slow_motion_video</span>
                <span>{isSlowMode ? '천천히 켜짐' : '천천히 듣기'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 추억 앨범 회상 섹션 */}
      <section className="px-4 my-2">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#f7ece5] overflow-hidden relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#ffdad3] text-[#7c2d1e] text-xs font-bold rounded-full">옛 추억 앨범</span>
              <span className="text-base font-bold text-[#201b17]">{currentMemory.year} {currentMemory.title}</span>
            </div>
            <span className="material-symbols-outlined text-[#88726e] text-[22px]">photo_library</span>
          </div>

          <div className="w-full h-52 rounded-2xl overflow-hidden relative shadow-inner bg-[#201b17]">
            <img src={currentMemory.imageUrl} alt={currentMemory.title} className="w-full h-full object-cover filter sepia-[0.25]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
              <p className="text-white text-sm font-medium drop-shadow flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#ffdad3]">auto_awesome</span>
                따뜻했던 그 시절 기억나시나요?
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-[#55423f] leading-relaxed">{currentMemory.description}</p>

          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#f7ece5] overflow-x-auto no-scrollbar">
            {NA_HANHEE_PROFILE.keyMemories.map((mem, idx) => (
              <button
                key={mem.title}
                onClick={() => {
                  setActiveMemoryIndex(idx);
                  handleSendMessage(`"${mem.title}" 사진 보니까 그때 생각이 나네요.`);
                }}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                  activeMemoryIndex === idx ? 'bg-[#9a4432] text-white shadow-sm' : 'bg-[#fdf1eb] text-[#55423f]'
                }`}
              >
                {mem.year} {mem.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 대화 스트림 */}
      <section className="px-4 my-2 flex flex-col gap-4">
        {dialogues.map((msg) => {
          if (msg.sender === 'bomi') {
            const isPlaying = currentlyPlayingId === msg.id;
            const isLoadingAudio = audioLoadingId === msg.id;
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-[92%]">
                <div className="flex items-center gap-2 mb-1.5 pl-1">
                  <div className="w-7 h-7 rounded-full bg-[#e27b66] text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                  </div>
                  <span className="text-xs font-bold text-[#9a4432]">다정봇 봄이</span>
                  <span className="text-[11px] text-[#88726e]">{msg.timestamp}</span>
                </div>
                <div className="bg-[#fdf1eb] text-[#201b17] rounded-3xl rounded-tl-sm p-4 shadow-sm border border-[#f1e6e0]">
                  <p className="text-base sm:text-lg leading-relaxed font-medium">&ldquo;{msg.text}&rdquo;</p>
                  <div className="mt-3 pt-2 border-t border-[#f1e6e0]/70 flex items-center gap-3">
                    <button
                      onClick={() => handlePlayVoice(msg.id, msg.text)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all shadow-sm cursor-pointer ${
                        isPlaying ? 'bg-[#ba1a1a] text-white animate-pulse' : isLoadingAudio ? 'bg-[#ffdad3] text-[#7c2d1e]' : 'bg-[#e27b66] text-white'
                      }`}
                      type="button"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isLoadingAudio ? 'animate-spin' : ''}`}>
                        {isPlaying ? 'volume_off' : isLoadingAudio ? 'sync' : 'volume_up'}
                      </span>
                      <span>{isPlaying ? '음성 멈추기' : isLoadingAudio ? '부드러운 음성 준비 중...' : '다시 듣기'}</span>
                    </button>
                    <span className="text-xs text-[#55423f] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#9a4432]">auto_awesome</span>
                      다정하고 부드러운 AI 목소리
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex flex-col items-end self-end max-w-[90%]">
              <div className="flex items-center gap-2 mb-1.5 pr-1">
                <span className="text-[11px] text-[#88726e]">{msg.timestamp}</span>
                <span className="text-xs font-semibold text-[#201b17]">나한희 어르신</span>
                <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm ring-1 ring-[#ffdad3]">
                  <img src={ASSETS.naHanheeProfile} alt="나한희 어르신" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-[#9a4432] text-white rounded-3xl rounded-tr-sm p-4 shadow-sm">
                <p className="text-base sm:text-lg leading-relaxed font-medium">&ldquo;{msg.text}&rdquo;</p>
              </div>
            </div>
          );
        })}
        {isLoadingReply && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#fdf1eb] max-w-[70%]">
            <span className="w-2 h-2 rounded-full bg-[#9a4432] animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-[#9a4432] animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#9a4432] animate-bounce [animation-delay:0.4s]"></span>
            <span className="text-xs text-[#55423f] ml-1">봄이가 다정하게 생각하고 있어요...</span>
          </div>
        )}
        <div ref={dialogueEndRef} />
      </section>

      {/* 빠른 답변 칩 */}
      <section className="px-4 my-2">
        <div className="flex flex-wrap gap-2">
          {['맞아요 참 좋았지요 😊', '그때 참 행복했지 🌸', '기억이 조금 가물가물해요 🤔', '우리 착한 딸 생각나네 ❤️', '달콤한 커피 한잔 할까 ☕'].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="min-h-[46px] px-4 py-2 rounded-full bg-white text-[#201b17] text-xs sm:text-sm font-semibold shadow-sm border border-[#f1e6e0] active:bg-[#ffdad3] cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* 마이크 및 입력창 */}
      <section className="px-4 mt-3">
        <div className="bg-[#fdf1eb] rounded-3xl p-5 shadow-sm border border-[#f1e6e0] flex flex-col items-center gap-4">
          <div className="flex flex-col items-center text-center">
            <button
              onClick={handleToggleListening}
              className={`w-20 h-20 rounded-full text-white shadow-xl flex items-center justify-center transition-all cursor-pointer ${
                isListening ? 'bg-[#ba1a1a] ring-4 ring-[#ffdad6]' : 'bg-[#9a4432] hover:bg-[#7c2d1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[36px]">{isListening ? 'stop' : 'mic'}</span>
            </button>
            <span className={`mt-2 text-base font-bold ${isListening ? 'text-[#ba1a1a]' : 'text-[#201b17]'}`}>
              {isListening ? '말씀을 듣고 있어요...' : '누르고 편하게 말씀하세요'}
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="w-full flex items-center gap-2 pt-2 border-t border-[#f1e6e0]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="어르신의 추억이나 생각을 적어주세요..."
              className="flex-1 h-12 px-4 rounded-full bg-white text-[#201b17] text-sm border border-[#f1e6e0] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoadingReply}
              className="h-12 px-5 rounded-full bg-[#9a4432] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              보내기
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

// [화면 5] 보호자 마음 상담실
const CounselingScreen: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customQ, setCustomQ] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const scenario = COUNSELING_SCENARIOS[selectedIdx];

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQ.trim() || isLoading) return;
    setIsLoading(true);
    try {
      await fetch('/api/caregiver/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: customQ }),
      });
      setCustomQ('');
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-28 gap-5">
      <section className="rounded-3xl bg-white p-5 shadow-sm border border-[#f7ece5]">
        <span className="px-3 py-0.5 rounded-full bg-[#ffdf9a] text-[#251a00] text-xs font-bold">마음 돌봄 클리닉</span>
        <h2 className="text-xl font-bold text-[#201b17] mt-2 leading-snug">
          보호자님의 지친 마음도<br /><span className="text-[#9a4432]">따뜻한 돌봄</span>이 필요합니다
        </h2>
        <p className="text-xs text-[#55423f] mt-1">자책하지 마세요. 어르신의 행동은 마음의 병일 뿐입니다.</p>
      </section>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {COUNSELING_SCENARIOS.map((sc, i) => (
          <button
            key={sc.id}
            onClick={() => setSelectedIdx(i)}
            className={`shrink-0 px-3.5 py-2.5 rounded-full text-xs font-semibold cursor-pointer ${
              selectedIdx === i ? 'bg-[#ffdf9a] text-[#251a00] ring-2 ring-[#785a00]' : 'bg-white text-[#55423f] border border-[#f1e6e0]'
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      <div className="bg-[#ffdf9a]/40 rounded-3xl p-5 border border-[#ffdf9a] space-y-4">
        <h3 className="font-bold text-sm text-[#251a00]">AI 닥터 임상 케어 가이드</h3>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#f1e6e0]">
          <h4 className="text-xs font-bold text-[#9a4432] mb-1">{scenario.medicalCause.title}</h4>
          <p className="text-xs text-[#55423f] leading-relaxed">{scenario.medicalCause.explanation}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#f1e6e0] space-y-2">
          <h4 className="text-xs font-bold text-[#9a4432]">권장 3단계 처방 솔루션</h4>
          <div className="p-2.5 rounded-xl bg-[#fdf1eb] text-xs">
            <strong className="text-[#201b17]">{scenario.threeSteps.stepA.title}:</strong>
            <p className="text-[#55423f] mt-0.5">&ldquo;{scenario.threeSteps.stepA.speech}&rdquo;</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#fdf1eb] text-xs">
            <strong className="text-[#201b17]">{scenario.threeSteps.stepB.title}:</strong>
            <p className="text-[#55423f] mt-0.5">&ldquo;{scenario.threeSteps.stepB.speech}&rdquo;</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#fdf1eb] text-xs">
            <strong className="text-[#201b17]">{scenario.threeSteps.stepC.title}:</strong>
            <p className="text-[#55423f] mt-0.5">&ldquo;{scenario.threeSteps.stepC.speech}&rdquo;</p>
          </div>
        </div>

        <button
          onClick={() => {
            setSavedNote(true);
            setTimeout(() => setSavedNote(false), 2500);
          }}
          className="w-full py-3 rounded-full bg-white border border-[#f1e6e0] text-xs font-bold text-[#201b17] shadow-sm cursor-pointer"
        >
          {savedNote ? '처방이 간병노트에 저장되었습니다' : '간병노트에 처방 저장하기'}
        </button>
      </div>

      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="text"
          value={customQ}
          onChange={(e) => setCustomQ(e.target.value)}
          placeholder="어르신과의 대화 중 생긴 고민을 말씀해 주세요..."
          className="flex-1 h-12 px-4 rounded-full bg-white text-xs text-[#201b17] border border-[#f1e6e0]"
        />
        <button type="submit" disabled={isLoading} className="px-5 h-12 rounded-full bg-[#9a4432] text-white text-xs font-bold">
          {isLoading ? '...' : '전송'}
        </button>
      </form>
    </div>
  );
};

// [화면 6] 대화 분석 보고서
const ReportScreen: React.FC<{ dialogues: DialogueMessage[] }> = () => (
  <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-20 pb-28 gap-5">
    <div className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad3] text-[#7c2d1e] text-xs font-bold w-fit">
        <span className="material-symbols-outlined text-[15px]">verified</span>
        최신 AI 심층분석완료
      </span>
      <h1 className="text-xl font-bold text-[#201b17] mt-1">주간 종합 인지기억 리포트</h1>
      <p className="text-xs text-[#55423f]">어머님의 대화 녹취 및 반응 속도를 기반으로 관찰된 인지 상태입니다.</p>
    </div>

    <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#f7ece5] flex items-center justify-around">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" fill="none" r="48" stroke="#f1e6e0" strokeWidth="12" />
          <circle cx="60" cy="60" fill="none" r="48" stroke="#e27b66" strokeDasharray="301.59" strokeDashoffset="66.35" strokeLinecap="round" strokeWidth="12" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[10px] text-[#55423f]">정서 긍정도</span>
          <span className="text-xl font-bold text-[#9a4432]">78%</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="p-2.5 rounded-xl bg-[#fdf1eb] text-xs">
          <span className="text-[#55423f]">기억 회상 일치율:</span> <strong className="text-[#201b17]">84%</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-[#fdf1eb] text-xs">
          <span className="text-[#55423f]">대화 반응 속도:</span> <strong className="text-[#201b17]">1.8초 (원활)</strong>
        </div>
      </div>
    </div>

    {/* 일일 모니터링 분석 보고서 (프롬프트 1 사양) */}
    <div className="bg-[#fff8f5] rounded-3xl p-5 shadow-md border-2 border-[#ffdad3] space-y-3">
      <h3 className="font-bold text-sm text-[#201b17] flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[#9a4432] text-lg">summarize</span>
        오늘의 대화 모니터링 분석 요약
      </h3>
      <ul className="text-xs text-[#201b17] space-y-1">
        <li>• 옛 추억 회상(창경원 벚꽃, 대학 밴드부) 시 언어 구사력과 정서 안정도 우수</li>
        <li>• 저녁 7시경 일시적 저녁 지남력 저하가 있었으나 옛 사진 제시로 10분 내 안정</li>
        <li>• 딸과 마시던 커피(맥심 화이트골드) 언급 시 발화 길이 3.2어절 증가하는 긍정 반응</li>
      </ul>
      <div className="p-3 bg-white rounded-xl text-xs space-y-1">
        <div><strong>낙상/공격성 위험:</strong> <span className="text-emerald-700 font-bold">현재 위험 신호 없음</span></div>
        <div><strong>즉시 대응 필요 여부:</strong> <span className="text-[#785a00] font-bold">현재는 일상적 관찰로 충분</span></div>
      </div>
    </div>
  </div>
);

// ============================================================================
// 8. 루트 최상위 App 컴포넌트
// ============================================================================
export default function App() {
  const [mode, setMode] = useState<AppMode>('welcome');
  const [dialogues, setDialogues] = useState<DialogueMessage[]>(INITIAL_DIALOGUES);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleAddDialogueMessage = (msg: DialogueMessage) => {
    setDialogues((prev) => [...prev, msg]);
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'elder_talk': return '어르신 대화 모드';
      case 'counseling': return '보호자 상담실';
      case 'report': return '대화 분석 보고서';
      case 'caregiver_home':
      default: return '보호자 홈';
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] text-[#201b17] flex flex-col selection:bg-[#ffdad3]">
      {mode !== 'welcome' && mode !== 'mode_select' && (
        <Header
          subtitle={getSubtitle()}
          onProfileClick={() => setIsProfileModalOpen(true)}
          onHomeClick={() => setMode('caregiver_home')}
        />
      )}

      <main className="flex-1 flex flex-col w-full">
        {mode === 'welcome' && <WelcomeScreen onStart={() => setMode('mode_select')} />}
        {mode === 'mode_select' && <ModeSelectScreen onSelect={(selectedMode) => setMode(selectedMode)} />}
        {mode === 'caregiver_home' && (
          <CaregiverHomeScreen
            onNavigate={(newMode) => setMode(newMode)}
            onOpenSeniorProfile={() => setIsProfileModalOpen(true)}
          />
        )}
        {mode === 'elder_talk' && (
          <ElderTalkScreen
            dialogues={dialogues}
            onAddMessage={handleAddDialogueMessage}
            onNavigateHome={() => setMode('caregiver_home')}
          />
        )}
        {mode === 'counseling' && <CounselingScreen />}
        {mode === 'report' && <ReportScreen dialogues={dialogues} />}
      </main>

      <Navigation currentMode={mode} onSelectMode={(newMode) => setMode(newMode)} />

      <SeniorProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}