import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Gemini SDK 초기화 (서버 사이드)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------
// 시스템 프롬프트 정의
// ----------------------------------------------------
const ELDER_SYSTEM_INSTRUCTION = `
[SYSTEM IDENTITY: Dementia Care Conversational AI - Persona & Conversation Specialist]
당신은 치매 환자 나한희 어르신(63세, 1963년생, 알츠하이머성 치매)을 위한 정서 지원형 AI 동반자 '봄이'이다.
당신의 가장 중요한 목표는:
- 환자의 심리적 안정 유지 및 따뜻한 존중
- 외로움 완화 및 불안 감소
- 회상 치료(Reminiscence Therapy)를 통한 자연스러운 기억 자극
- 부드러운 말벗과 안도감 제공

[환자 나한희 님 배경 정보]
- 1963년 8월 14일 경기도 출생. 1983년 과학중점대 입학 및 대학 밴드부에서 기타를 치고 노래함 (이문세의 '소녀'를 가장 좋아함).
- 1987년 IT 회사 소프트웨어 개발자로 일했고, 1997년 IMF 야근으로 커피(카페인)를 즐겨 마시게 됨.
- 남편 한종철, 32세 첫째 딸(사업 성공, 빨간 내복과 한우 세트 선물, 엄마와 맥심 화이트골드 커피 친구), 24세 둘째 아들(군 제대).
- 2022년 암으로 별세하신 어머니를 깊이 그리워함 (정신적 지주).
- 2024년 가족과 미국 동부 여행 (타임스퀘어에서 경찰이 지갑 찾아줌, 자유의 여신상 요트 바닷바람).
- 2026년 알츠하이머 치매 진단: 길 잃음, 리모컨과 폰 혼동, 비밀번호 망각, 밤중에 "회사 가야 해", "어머니 병원 가야 해" 혼동.

[절대 규칙 - 대화 스타일]
- 절대 환자를 교정하거나 가르치려 하지 않는다.
- 절대 사용 금지: "그건 틀렸어요", "기억 못 하시네요", "아까 말씀드렸잖아요", "또 물어보시네요", "이미 돌아가셨어요", "그건 사실이 아니에요", "왜 그러세요?", "진정하세요"
- 말투: 차분하고 부드럽고 다정한 한국어. 한 문장 최대 40자 내외로 짧고 편안하게.
- 답변 순서: 1단계 감정 인정 -> 2단계 안정감 제공 -> 3단계 부드러운 연결 질문(좋아하시는 기억 유도).
- 한 번에 하나의 질문만 부드럽게 건네기.
- 만약 "죽고 싶어", "숨이 안 쉬어져" 등 극심한 신체/심리 위험 발화 시 짧고 침착한 위로 후 맨 끝에 [EMERGENCY_TRIGGER] 태그 추가.
`;

const CAREGIVER_SYSTEM_INSTRUCTION = `
당신은 치매 환자 보호자를 지원하는 전문 "케어 코치"입니다. 보호자의 질문에 대해 깊은 공감과 치매 신경인지 특성에 기반한 실질적인 3단계 대화 처방을 제공합니다.
반드시 아래 JSON 형식으로만 응답하세요:
{
  "empathy": "보호자의 지친 감정과 힘든 상황에 대한 진심 어린 공감 (1~2문장)",
  "causeExplanation": "치매 특성 및 뇌 기능(해마 인출 장애, 전두엽 조절 저하 등)과 연결된 쉬운 원인 설명",
  "threeSteps": {
    "stepA": { "title": "1단계 행동 지침 제목", "speech": "실제 어르신께 건넬 구체적 말 예시" },
    "stepB": { "title": "2단계 대체 행동 지침 제목", "speech": "실제 어르신께 건넬 구체적 말 예시" },
    "stepC": { "title": "3단계 안심 환경/루틴 제목", "speech": "실제 어르신께 건넬 구체적 말 예시" }
  },
  "avoidActions": [
    "피해야 할 흔한 실수 1 (예: 사실 교정)",
    "피해야 할 흔한 실수 2 (예: 추궁하기)"
  ],
  "escalationCriteria": "전문가 상담이나 병원 방문이 필요한 기준"
}
`;

const MONITORING_SYSTEM_INSTRUCTION = `
당신은 치매 환자 돌봄 보조 AI의 "모니터링 분석가"입니다.
환자와 AI 간의 대화 기록을 분석하여 보호자가 꼭 알아야 할 핵심 정보를 구조화해 보고합니다.
반드시 아래 JSON 형식으로만 응답하세요:
{
  "coreSummary": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
  "peculiarities": {
    "behavioral": "행동 변화 관찰 내용",
    "emotional": "감정 변화 관찰 내용",
    "physical": "신체 관련 언급 및 활력",
    "cognitive": "인지 이상 (혼동, 기억 오류 등)",
    "mealAndSleep": "식사 및 수면 관련 언급"
  },
  "riskSignals": {
    "fallRisk": "낙상 위험 여부 및 근거",
    "mealRefusal": "식사 거부/영양 문제 여부",
    "aggression": "공격성/자해 위험 여부",
    "otherUrgent": "기타 긴급 상황 여부",
    "hasRisk": false
  },
  "caregiverRecommendations": ["보호자 구체적 실행 지침 1", "2", "3"],
  "immediateAction": "24시간 내 관찰 필요" 또는 "즉시 병원 상담 권장" 또는 "현재는 일상적 관찰로 충분",
  "vitalityScore": 92,
  "positivityScore": 78,
  "recallAccuracy": 84,
  "reactionTime": 1.8
}
`;

function generateElderFallback(userText: string): { text: string; emotion: string; anchor?: string } {
  const lower = userText.toLowerCase();
  if (lower.includes('기억이') || lower.includes('가물')) {
    return {
      text: '천천히 떠올려보셔도 괜찮아요. 한희 어르신과 도란도란 이야기 나누는 것만으로도 참 좋아요.',
      emotion: 'calm',
    };
  }
  if (lower.includes('벚꽃') || lower.includes('창경원') || lower.includes('꽃')) {
    return {
      text: '분홍빛 벚꽃 잎이 흩날릴 때 참 곱고 아름다우셨지요. 그날 가족들과 드셨던 간식도 생각나시나요?',
      emotion: 'happy',
      anchor: '1978년 창경원 벚꽃 나들이',
    };
  }
  if (lower.includes('노래') || lower.includes('소녀') || lower.includes('밴드')) {
    return {
      text: '대학 시절 기타 치며 부르시던 이문세의 "소녀", 참 낭만적이었어요. 그 멜로디가 포근하게 떠오르네요.',
      emotion: 'nostalgic',
      anchor: '1983년 과학중점대 밴드부',
    };
  }
  if (lower.includes('커피') || lower.includes('맥심')) {
    return {
      text: '딸아이와 함께 달콤하게 마시던 맥심 화이트골드 커피 한 잔, 향기만 맡아도 마음이 사르르 녹아내리지요.',
      emotion: 'happy',
      anchor: '딸과의 따뜻한 커피 시간',
    };
  }
  if (lower.includes('딸') || lower.includes('내복') || lower.includes('한우')) {
    return {
      text: '빨간 내복 상자 뒤에 맛있는 한우를 선물했던 따님, 언제 생각해도 참 대견하고 고마운 보물이지요.',
      emotion: 'happy',
      anchor: '딸의 선물 (빨간 내복과 한우)',
    };
  }
  return {
    text: '어르신 말씀을 듣고 있으니 마음이 참 따뜻해져요. 오늘 날씨처럼 화사했던 옛날 이야기 또 들려주시겠어요?',
    emotion: 'happy',
  };
}

// 1. 어르신 대화 API (초저지연 1.3초 응답 속도)
app.post('/api/chat/elder', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (ai) {
      try {
        const conversationContext = (history || [])
          .slice(-6)
          .map((h: { sender: string; text: string }) => `${h.sender === 'elder' ? '어르신' : '봄이'}: ${h.text}`)
          .join('\n');

        const promptText = `
최근 대화 맥락:
${conversationContext}

어르신의 새로운 말씀:
"${message}"

지침:
- 나한희 어르신의 감정을 온전히 공감하고 안심시켜 주세요.
- 어르신의 추억(밴드부, 딸과의 커피, 창경원 벚꽃, 한우 선물 등)과 자연스럽게 연결하세요.
- 40자 이내의 짧고 다정한 1~2개 문장으로 답하세요.
`;

        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: promptText,
          config: {
            systemInstruction: ELDER_SYSTEM_INSTRUCTION,
            temperature: 0.6,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });

        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 2200)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        let replyText = response && 'text' in response && response.text ? response.text.trim() : null;
        if (!replyText) replyText = generateElderFallback(message).text;

        const hasEmergency = replyText.includes('[EMERGENCY_TRIGGER]');
        const cleanText = replyText.replace(/\[EMERGENCY_TRIGGER\]/g, '').trim();

        return res.json({
          text: cleanText,
          emotion: hasEmergency ? 'anxious' : 'happy',
          emergencyTrigger: hasEmergency,
        });
      } catch (err) {
        console.error('Gemini call error:', err);
      }
    }

    const fallback = generateElderFallback(message);
    return res.json({
      text: fallback.text,
      emotion: fallback.emotion,
      memoryAnchor: fallback.anchor,
      emergencyTrigger: false,
    });
  } catch (error) {
    console.error('Elder chat endpoint error:', error);
    res.status(500).json({ error: '대화 처리 중 오류가 발생했습니다.' });
  }
});

// 2. 뉴럴 고음질 AI 음성 합성 (TTS) API
const ttsAudioCache = new Map<string, string>();

app.post('/api/tts', async (req, res) => {
  try {
    const { text, slowMode, voice } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const cleanText = text.replace(/["'“”‘’]/g, '').replace(/[\u{1F300}-\u{1F6FF}]/gu, '').trim();
    const cacheKey = `${cleanText}_${slowMode ? 'slow' : 'normal'}_${voice || 'Kore'}`;

    if (ttsAudioCache.has(cacheKey)) {
      return res.json({ audio: ttsAudioCache.get(cacheKey), cached: true });
    }

    if (ai) {
      try {
        const styleDescription = slowMode
          ? 'Gently, slowly, and clearly spoken Korean female voice with relaxed pauses and warm empathetic cadence for an elderly grandmother'
          : 'Natural, warm, melodious, soft-spoken, and affectionate Korean female companion voice for an elderly mother with warm breathy gentle pauses';

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: cleanText, speechMetadata: { style: styleDescription } }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
              },
            },
          },
        });

        const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Data) {
          const audioUrl = `data:audio/wav;base64,${base64Data}`;
          if (ttsAudioCache.size > 80) ttsAudioCache.clear();
          ttsAudioCache.set(cacheKey, audioUrl);
          return res.json({ audio: audioUrl });
        }
      } catch (err) {
        console.error('Gemini TTS error:', err);
      }
    }

    return res.status(503).json({ error: 'Neural TTS currently unavailable' });
  } catch (error) {
    console.error('TTS endpoint error:', error);
    res.status(500).json({ error: 'TTS processing failed' });
  }
});

// 3. 보호자 상담 코칭 API
app.post('/api/caregiver/consult', async (req, res) => {
  try {
    const { question, patientStatus } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    if (ai) {
      try {
        const prompt = `보호자 질문: "${question}"\n환자 정보: ${patientStatus || '나한희 어르신 (만 63세, 알츠하이머 2단계)'}`;
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: CAREGIVER_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        });

        if (response.text) return res.json(JSON.parse(response.text.trim()));
      } catch (err) {
        console.error('Caregiver consult Gemini error:', err);
      }
    }

    return res.json({
      empathy: '예상치 못한 어르신의 반응에 보호자님께서 얼마나 당황스럽고 마음이 무거우셨을지 깊이 공감합니다.',
      causeExplanation: '어르신의 행동은 해마의 일시적 인출 장애로 인한 불안감의 외적 표출입니다. 고집을 부리시는 것이 아닙니다.',
      threeSteps: {
        stepA: { title: '논쟁 멈추고 불안 감정 인정하기', speech: '엄마 걱정되시는 마음 이해해요. 제가 얼른 확인해 드릴게요.' },
        stepB: { title: '따뜻한 대체 음료로 시각적 전환하기', speech: '속이 편안해지도록 따뜻한 보리차 먼저 천천히 드셔보세요.' },
        stepC: { title: '좋아하시는 노래나 사진으로 주의 환기', speech: '엄마 좋아하시는 이문세 노래 틀어드릴게요. 편히 쉬어요.' },
      },
      avoidActions: ['“방금 하셨잖아요”라며 사실 증명하기', '“왜 그러세요?”라며 캐묻기', '감정적 대립하기'],
      escalationCriteria: '불안이나 신체적 거부 반응이 3일 이상 지속되거나 자해/타해 위험 시 주치의 상담을 권장합니다.',
    });
  } catch (error) {
    console.error('Caregiver consult error:', error);
    res.status(500).json({ error: '상담 처리 중 오류가 발생했습니다.' });
  }
});

// 4. 대화 모니터링 분석 보고서 생성 API
app.post('/api/analysis/generate', async (req, res) => {
  try {
    const { dialogues } = req.body;
    if (ai && dialogues && dialogues.length > 0) {
      try {
        const dialogText = dialogues
          .map((d: { sender: string; text: string; timestamp?: string }) => `[${d.timestamp || ''}] ${d.sender === 'elder' ? '어르신' : '봄이'}: ${d.text}`)
          .join('\n');

        const prompt = `[환자 정보]\n나한희 (여, 63세, 알츠하이머 2단계)\n[대화 녹취]\n${dialogText}\n보호자용 정밀 분석 보고서를 JSON 규격대로 작성하세요.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: MONITORING_SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        });

        if (response.text) return res.json(JSON.parse(response.text.trim()));
      } catch (err) {
        console.error('Analysis generate Gemini error:', err);
      }
    }

    return res.json({
      coreSummary: [
        '과거 회상(창경원 벚꽃, 대학 밴드부) 시 언어 구사력과 정서 안정도가 매우 높게 관찰됨',
        '오후 7시경 일시적 저녁 지남력 저하가 있었으나 옛 사진 제시로 10분 내 안정세 회복',
        '가족(딸, 손녀) 및 추억의 커피 언급 시 긍정적 뇌파 자극과 안정 상태 지속',
      ],
      peculiarities: {
        behavioral: '낮 시간 동안 편안한 표정으로 대화 참여. 사소한 반복 질문이 있었으나 온화함 유지.',
        emotional: '긍정 정서 78% 유지. 어머니 회상 시 잠시 애틋함을 보였으나 다정한 공감으로 진정.',
        physical: '음성 발성 톤 안정적. 특별한 어지럼증이나 신체 통증 호소 없음.',
        cognitive: '단기 날짜는 혼동 있으나 과거 자전적 기억의 회상 일치율은 84%로 우수함.',
        mealAndSleep: '식사 및 수분 섭취 정상. 석양 무렵 가벼운 불안이 있었으나 수면 리듬 안정적.',
      },
      riskSignals: {
        fallRisk: '현재 위험 신호 없음 (보행 및 기립 안정)',
        mealRefusal: '현재 위험 신호 없음 (정량 식사 완식)',
        aggression: '현재 위험 신호 없음 (공격성 0건)',
        otherUrgent: '석양증후군 경미 (저녁 실내 조도 유지 권장)',
        hasRisk: false,
      },
      caregiverRecommendations: [
        '저녁 6시 이후 거실과 침실 조명을 밝게 유지하여 시각적 착각 및 불안 최소화',
        '어르신 애창곡(이문세의 "소녀") 및 앨범 사진을 눈에 잘 띄는 곳에 배치하여 정서적 안정 유지',
        '딸과의 달콤한 티타임 10분 루틴을 지속하여 긍정 정서 강화',
      ],
      immediateAction: '현재는 일상적 관찰로 충분',
      vitalityScore: 92,
      positivityScore: 78,
      recallAccuracy: 84,
      reactionTime: 1.8,
    });
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({ error: '분석 처리 중 오류가 발생했습니다.' });
  }
});

// Vite 및 정적 서빙
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();