// ========================================
// EasyTalk - 쉬운 말 변환 커뮤니케이션 애플리케이션
// 게스트용 진짜 사전 & 테스트 기능 포함
// ========================================

// 전역 변수
let currentResult = '';
let currentOriginal = '';
let isAdmin = false;
let isGuest = false;
let currentUser = null;
let aiDifficultyLevel = 2;
let detectedDifficultWords = [];
let wordMappings = [];
let currentQuizWord = null;
let aiStats = {
    todayDetected: 0,
    autoConverted: 0,
    totalConversions: 0,
    accuracy: 100
};

// 기본 변환 규칙
const conversionRules = {
    "안녕하십니까": "안녕하세요",
    "감사드립니다": "감사해요",
    "죄송합니다": "죄송해요",
    "성함": "이름",
    "예약": "미리 정하기",
    "진료": "병원에서 보기",
    "처방전": "약 받는 종이",
    "수납": "돈 내기",
    "접수": "신청하기"
};

// EasyTalk AI: 실제 어려운 단어 데이터베이스
const easyTalkAI = {
    1: { // 기본 레벨
        "확인": "알아보기", "연락": "전화하기", "방문": "찾아가기", "대기": "기다리기",
        "신청": "요청하기", "취소": "그만두기", "변경": "바꾸기", "완료": "끝내기",
        "협조": "도움", "문의": "질문하기", "안내": "알려주기", "양해": "이해"
    },
    2: { // 보통 레벨
        "확인": "알아보기", "연락": "전화하기", "방문": "찾아가기", "대기": "기다리기",
        "신청": "요청하기", "취소": "그만두기", "변경": "바꾸기", "완료": "끝내기",
        "협조": "도움", "문의": "질문하기", "안내": "알려주기", "양해": "이해",
        "승차": "타기", "하차": "내리기", "환승": "갈아타기", "계산": "돈 세기",
        "결제": "돈 내기", "주문": "시키기", "배송": "보내기", "교환": "바꾸기",
        "반품": "돌려주기", "할인": "싸게", "적립": "모으기", "발급": "만들어 주기",
        "제출": "내기", "검토": "살펴보기", "승인": "허락하기", "거부": "안 된다고 하기"
    },
    3: { // 고급 레벨
        "확인": "알아보기", "연락": "전화하기", "방문": "찾아가기", "대기": "기다리기",
        "신청": "요청하기", "취소": "그만두기", "변경": "바꾸기", "완료": "끝내기",
        "협조": "도움", "문의": "질문하기", "안내": "알려주기", "양해": "이해",
        "승차": "타기", "하차": "내리기", "환승": "갈아타기", "계산": "돈 세기",
        "결제": "돈 내기", "주문": "시키기", "배송": "보내기", "교환": "바꾸기",
        "반품": "돌려주기", "할인": "싸게", "적립": "모으기", "발급": "만들어 주기",
        "제출": "내기", "검토": "살펴보기", "승인": "허락하기", "거부": "안 된다고 하기",
        "구비": "준비하기", "지참": "가져오기", "소지": "가지고 있기", "휴대": "들고 다니기",
        "착용": "입기", "탈의": "벗기", "착석": "앉기", "기립": "서기",
        "보행": "걷기", "정차": "멈추기", "출발": "떠나기", "도착": "이르기",
        "거주": "살기", "체류": "머물기", "숙박": "잠자기", "투숙": "호텔에 묵기"
    }
};

// 진짜 한국어 사전 (게스트용)
const realKoreanDictionary = {
    // 기본 단어들
    "확인": {
        meaning: "어떤 사실이나 내용을 자세히 알아보거나 틀림없음을 조사하여 확실하게 하는 것",
        pronunciation: "[확인]",
        example: "예약 시간을 확인해 주세요.",
        easy: "알아보기"
    },
    "협조": {
        meaning: "서로 마음과 힘을 합하여 도움",
        pronunciation: "[협ː조]",
        example: "모든 분들의 협조가 필요합니다.",
        easy: "도움"
    },
    "신청": {
        meaning: "어떤 일을 해 달라고 관계 기관이나 사람에게 청하여 요구하는 일",
        pronunciation: "[신청]",
        example: "대출 신청을 하고 싶습니다.",
        easy: "요청하기"
    },
    "제출": {
        meaning: "서류나 물건 따위를 관계 기관이나 윗사람에게 내어 바치는 것",
        pronunciation: "[제출]",
        example: "서류를 내일까지 제출해 주세요.",
        easy: "내기"
    },
    "방문": {
        meaning: "어떤 목적을 가지고 다른 사람을 찾아가거나 어떤 장소에 가는 것",
        pronunciation: "[방문]",
        example: "병원에 방문하겠습니다.",
        easy: "찾아가기"
    },
    "연락": {
        meaning: "서로 소식을 주고받거나 관계를 맺는 것",
        pronunciation: "[연락]",
        example: "언제든지 연락 주세요.",
        easy: "전화하기"
    },
    "대기": {
        meaning: "무엇을 기다리는 것",
        pronunciation: "[대기]",
        example: "잠시만 대기해 주세요.",
        easy: "기다리기"
    },
    "취소": {
        meaning: "이미 정한 것을 없던 일로 하는 것",
        pronunciation: "[취소]",
        example: "예약을 취소하고 싶습니다.",
        easy: "그만두기"
    },
    "변경": {
        meaning: "바꾸어서 고치는 것",
        pronunciation: "[변경]",
        example: "시간 변경이 가능한가요?",
        easy: "바꾸기"
    },
    "완료": {
        meaning: "일을 끝까지 마치는 것",
        pronunciation: "[완료]",
        example: "작업이 완료되었습니다.",
        easy: "끝내기"
    },
    "문의": {
        meaning: "어떤 일에 대하여 묻는 것",
        pronunciation: "[문의]",
        example: "가격 문의드립니다.",
        easy: "질문하기"
    },
    "안내": {
        meaning: "길이나 방향을 가르쳐 주거나 설명해 주는 것",
        pronunciation: "[안내]",
        example: "입구 안내를 부탁드립니다.",
        easy: "알려주기"
    },
    "양해": {
        meaning: "남의 사정을 잘 알아주고 너그러이 받아들이는 것",
        pronunciation: "[양해]",
        example: "양해 부탁드립니다.",
        easy: "이해"
    },
    "성함": {
        meaning: "다른 사람의 이름을 높여 이르는 말",
        pronunciation: "[성함]",
        example: "성함을 알려주세요.",
        easy: "이름"
    },
    "진료": {
        meaning: "의사가 환자의 병을 진찰하고 치료하는 일",
        pronunciation: "[진료]",
        example: "오전에 진료 받겠습니다.",
        easy: "병원에서 보기"
    },
    "처방전": {
        meaning: "의사가 환자에게 줄 약의 이름과 복용 방법 등을 적어 주는 종이",
        pronunciation: "[처방전]",
        example: "처방전을 가져오세요.",
        easy: "약 받는 종이"
    },
    "수납": {
        meaning: "돈이나 물건 따위를 받아서 정리하여 넣어 두는 것",
        pronunciation: "[수납]",
        example: "수납대에서 계산해 주세요.",
        easy: "돈 내기"
    },
    "접수": {
        meaning: "신청이나 신고 따위를 받아들이는 것",
        pronunciation: "[접수]",
        example: "접수를 먼저 해주세요.",
        easy: "신청하기"
    },
    "예약": {
        meaning: "미리 약속을 정하여 두는 것",
        pronunciation: "[예약]",
        example: "내일 2시에 예약했습니다.",
        easy: "미리 정하기"
    }
};

// ========================================
// 초기화 및 이벤트 설정
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎤 EasyTalk - 쉬운 말 변환 커뮤니케이션 애플리케이션 로드 완료');
    setupKeyboardEvents();
    loadSettings();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
});

function setupKeyboardEvents() {
    const loginPassword = document.getElementById('loginPassword');
    const loginId = document.getElementById('loginId');
    
    if (loginPassword) {
        loginPassword.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                adminLogin();
            }
        });
    }
    
    if (loginId) {
        loginId.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('loginPassword').focus();
            }
        });
    }
}

function setupMainAppEvents() {
    // 텍스트 변환 이벤트
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                convertText();
            }
        });
    }
    
    // 관리자 AI 규칙 이벤트
    if (isAdmin) {
        const aiOriginal = document.getElementById('aiOriginal');
        const aiConverted = document.getElementById('aiConverted');
        
        if (aiOriginal) {
            aiOriginal.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    aiConverted.focus();
                }
            });
        }
        
        if (aiConverted) {
            aiConverted.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addAIRule();
                }
            });
        }
    }
    
    // 게스트 사전 검색 이벤트
    if (isGuest) {
        const dictionaryInput = document.getElementById('dictionaryInput');
        if (dictionaryInput) {
            dictionaryInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    searchRealDictionary();
                }
            });
        }
    }
    
    // ESC 키 이벤트
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideFeedback();
            hideWordEdit();
            hideTest();
        }
    });
}

function loadSettings() {
    const savedLevel = localStorage.getItem('easytalk_ai_difficulty_level');
    if (savedLevel) {
        aiDifficultyLevel = parseInt(savedLevel);
    }
    
    const savedStats = localStorage.getItem('easytalk_ai_stats');
    if (savedStats) {
        try {
            aiStats = JSON.parse(savedStats);
        } catch (e) {
            console.log('통계 로드 실패, 기본값 사용');
        }
    }
}

// ========================================
// 로그인 관련 함수들
// ========================================

function adminLogin() {
    console.log('관리자 로그인 시도');
    
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('입력된 ID:', id);
    console.log('입력된 Password:', password);
    
    if (id === 'EASY TALK' && password === '1234') {
        console.log('관리자 로그인 성공');
        isAdmin = true;
        isGuest = false;
        currentUser = 'EASY TALK';
        
        // 화면 전환
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('dictionarySection').style.display = 'none';
        document.getElementById('adminIndicator').style.display = 'block';
        document.getElementById('guestIndicator').style.display = 'none';
        document.getElementById('adminWordSection').style.display = 'block';
        document.getElementById('guestWordSection').style.display = 'none';
        
        showAlert('🔴 관리자 "EASY TALK"로 로그인했습니다!', 'success');
        
        setupMainAppEvents();
        loadAllData();
        
    } else {
        console.log('관리자 로그인 실패');
        showAlert('❌ 관리자 정보가 잘못되었습니다.', 'error');
    }
}

function guestLogin() {
    console.log('게스트 로그인 시도');
    
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('입력된 ID:', id);
    console.log('입력된 Password:', password);
    
    if (id === 'guest' && password === 'guest123') {
        console.log('게스트 로그인 성공');
        isAdmin = false;
        isGuest = true;
        currentUser = 'guest';
        
        // 화면 전환
document.getElementById('loginScreen').style.display = 'none';
       document.getElementById('mainApp').style.display = 'block';
       document.getElementById('adminSection').style.display = 'none';
       document.getElementById('dictionarySection').style.display = 'block';
       document.getElementById('adminIndicator').style.display = 'none';
       document.getElementById('guestIndicator').style.display = 'block';
       document.getElementById('adminWordSection').style.display = 'none';
       document.getElementById('guestWordSection').style.display = 'block';
       
       showAlert('👤 게스트로 로그인했습니다! 진짜 사전을 사용해보세요!', 'success');
       
       setupMainAppEvents();
       loadAllData();
       
   } else {
       console.log('게스트 로그인 실패');
       showAlert('❌ 게스트 정보가 잘못되었습니다.', 'error');
   }
}

function logout() {
   if (confirm('로그아웃 하시겠습니까?')) {
       isAdmin = false;
       isGuest = false;
       currentUser = null;
       
       document.getElementById('loginScreen').style.display = 'flex';
       document.getElementById('mainApp').style.display = 'none';
       document.getElementById('loginId').value = '';
       document.getElementById('loginPassword').value = '';
       
       showAlert('🚪 로그아웃되었습니다.', 'info');
   }
}

function loadAllData() {
   console.log('모든 데이터 로드 시작');
   loadWords();
   updateStats();
   updateAIStatus();
   loadAIHistory();
   
   if (isAdmin) {
       updateAIRulesList();
       updateAdminAIStatus();
       document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
       const diffBtn = document.getElementById(`diff${aiDifficultyLevel}`);
       if (diffBtn) {
           diffBtn.classList.add('active');
       }
   }
   
   console.log('모든 데이터 로드 완료');
}

// ========================================
// 게스트 전용: 진짜 사전 검색 기능
// ========================================

function searchRealDictionary() {
   const word = document.getElementById('dictionaryInput').value.trim();
   
   if (!word) {
       showAlert('검색할 단어를 입력해주세요.', 'warning');
       return;
   }
   
   const wordInfo = realKoreanDictionary[word];
   const resultDiv = document.getElementById('dictionaryResult');
   const infoDiv = document.getElementById('wordInfo');
   
   if (wordInfo) {
       infoDiv.innerHTML = `
           <div style="margin-bottom: 15px;">
               <strong style="color: #059669; font-size: 24px;">"${word}"</strong>
               <span style="color: #6b7280; font-size: 16px; margin-left: 10px;">${wordInfo.pronunciation}</span>
           </div>
           
           <div class="word-meaning">
               📖 <strong>뜻:</strong><br>
               ${wordInfo.meaning}
           </div>
           
           <div class="example">
               💬 <strong>예문:</strong><br>
               "${wordInfo.example}"
           </div>
           
           <div class="pronunciation">
               ✨ <strong>쉬운 말:</strong> ${wordInfo.easy}
           </div>
       `;
       resultDiv.style.display = 'block';
       currentQuizWord = word;
       showAlert(`📖 "${word}"의 뜻을 찾았습니다!`, 'success');
   } else {
       infoDiv.innerHTML = `
           <div style="margin-bottom: 15px;">
               <strong style="color: #dc2626; font-size: 20px;">"${word}"</strong>
           </div>
           <div style="color: #666; text-align: center; padding: 30px;">
               😔 죄송합니다. 이 단어는 사전에 없습니다.<br>
               <div style="margin-top: 15px; font-size: 14px; color: #059669;">
                   <strong>검색 가능한 단어:</strong><br>
                   확인, 협조, 신청, 제출, 방문, 연락, 대기, 취소, 변경, 완료, 문의, 안내, 양해, 성함, 진료, 처방전, 수납, 접수, 예약
               </div>
           </div>
       `;
       resultDiv.style.display = 'block';
       currentQuizWord = null;
       showAlert(`❌ "${word}"을 사전에서 찾을 수 없습니다.`, 'warning');
   }
   
   resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// 게스트 전용: 단어 테스트 기능
// ========================================

function startQuiz() {
   if (!currentQuizWord || !realKoreanDictionary[currentQuizWord]) {
       showAlert('먼저 사전에서 단어를 검색해주세요.', 'warning');
       return;
   }
   
   createQuiz(currentQuizWord);
   document.getElementById('testSection').style.display = 'block';
   document.getElementById('testSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateRandomQuiz() {
   const words = Object.keys(realKoreanDictionary);
   const randomWord = words[Math.floor(Math.random() * words.length)];
   createQuiz(randomWord);
   showAlert(`🎲 랜덤 단어 "${randomWord}" 테스트를 시작합니다!`, 'info');
}

function createQuiz(word) {
   const wordInfo = realKoreanDictionary[word];
   if (!wordInfo) return;
   
   // 퀴즈 초기화
   document.getElementById('quizResult').style.display = 'none';
   document.getElementById('quizContainer').style.display = 'block';
   
   // 단어 표시
   document.getElementById('quizWord').textContent = word;
   
   // 정답과 오답 선택지 생성
   const correctAnswer = wordInfo.meaning;
   const wrongAnswers = getWrongAnswers(word, correctAnswer);
   
   // 선택지 섞기
   const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
   
   // 선택지 HTML 생성
   const optionsContainer = document.getElementById('quizOptions');
   optionsContainer.innerHTML = options.map((option, index) => `
       <div class="quiz-option" onclick="selectAnswer('${word}', '${escapeHtml(option)}', '${escapeHtml(correctAnswer)}')">
           ${option.length > 50 ? option.substring(0, 50) + '...' : option}
       </div>
   `).join('');
}

function getWrongAnswers(word, correctAnswer) {
   const allMeanings = Object.values(realKoreanDictionary).map(info => info.meaning);
   const wrongAnswers = allMeanings.filter(meaning => meaning !== correctAnswer);
   
   // 랜덤하게 3개 선택
   const shuffled = wrongAnswers.sort(() => Math.random() - 0.5);
   return shuffled.slice(0, 3);
}

function selectAnswer(word, selectedAnswer, correctAnswer) {
   const options = document.querySelectorAll('.quiz-option');
   const isCorrect = selectedAnswer === correctAnswer;
   
   // 모든 선택지 색칠
   options.forEach(option => {
       const optionText = option.textContent.trim();
       if (optionText === selectedAnswer || (selectedAnswer.length > 50 && optionText === selectedAnswer.substring(0, 50) + '...')) {
           option.classList.add(isCorrect ? 'correct' : 'wrong');
       } else if (optionText === correctAnswer || (correctAnswer.length > 50 && optionText === correctAnswer.substring(0, 50) + '...')) {
           option.classList.add('correct');
       }
       option.style.pointerEvents = 'none';
   });
   
   // 결과 표시
   setTimeout(() => {
       showQuizResult(word, isCorrect);
   }, 1000);
}

function showQuizResult(word, isCorrect) {
   const resultDiv = document.getElementById('quizResult');
   const resultText = document.getElementById('quizResultText');
   const wordInfo = realKoreanDictionary[word];
   
   if (isCorrect) {
       resultText.innerHTML = `
           <div style="color: #059669; font-size: 20px; margin-bottom: 15px;">
               🎉 정답입니다!
           </div>
           <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
               <strong>"${word}"</strong>의 뜻을 정확히 알고 계시네요!<br>
               <span style="color: #059669;">✨ 쉬운 말: ${wordInfo.easy}</span>
           </div>
       `;
   } else {
       resultText.innerHTML = `
           <div style="color: #dc2626; font-size: 20px; margin-bottom: 15px;">
               😅 아쉽네요!
           </div>
           <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
               <strong>"${word}"</strong>의 정확한 뜻:<br>
               ${wordInfo.meaning}<br><br>
               <span style="color: #059669;">✨ 쉬운 말: ${wordInfo.easy}</span>
           </div>
       `;
   }
   
   document.getElementById('quizContainer').style.display = 'none';
   resultDiv.style.display = 'block';
   
   showAlert(isCorrect ? '🎉 정답입니다!' : '😅 다시 공부해보세요!', isCorrect ? 'success' : 'info');
}

function hideTest() {
   document.getElementById('testSection').style.display = 'none';
}

// ========================================
// 관리자 전용 함수들
// ========================================

function setDifficulty(level) {
   if (!isAdmin) {
       showAlert('❌ 관리자만 접근할 수 있습니다.', 'error');
       return;
   }
   
   aiDifficultyLevel = level;
   
   document.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('active'));
   const targetBtn = document.getElementById(`diff${level}`);
   if (targetBtn) {
       targetBtn.classList.add('active');
   }
   
   const levels = { 1: '기본', 2: '보통', 3: '고급' };
   showAlert(`🤖 EasyTalk AI 똑똑함 레벨이 "${levels[level]}"으로 설정되었습니다.`, 'success');
   
   localStorage.setItem('easytalk_ai_difficulty_level', level.toString());
   updateAIStatus();
   updateAdminAIStatus();
}

function addAIRule() {
   if (!isAdmin) {
       showAlert('❌ 관리자만 접근할 수 있습니다.', 'error');
       return;
   }
   
   const original = document.getElementById('aiOriginal').value.trim();
   const converted = document.getElementById('aiConverted').value.trim();
   
   if (!original || !converted) {
       showAlert('어려운 단어와 쉬운 단어를 모두 입력해주세요.', 'warning');
       return;
   }
   
   if (original === converted) {
       showAlert('원래 단어와 바꿀 단어가 같습니다.', 'warning');
       return;
   }
   
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   aiRules[original] = converted;
   localStorage.setItem('easytalk_ai_custom_rules', JSON.stringify(aiRules));
   
   document.getElementById('aiOriginal').value = '';
   document.getElementById('aiConverted').value = '';
   
   showAlert(`🤖 EasyTalk AI 규칙 추가: "${original}" → "${converted}"`, 'success');
   updateAIRulesList();
   updateAdminAIStatus();
   loadLearningActivity();
   
   setTimeout(() => {
       const aiOriginalInput = document.getElementById('aiOriginal');
       if (aiOriginalInput) {
           aiOriginalInput.focus();
       }
   }, 300);
}

function updateAIRulesList() {
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   const container = document.getElementById('aiRulesList');
   const countElement = document.getElementById('aiRuleCount');
   
   if (!container || !countElement) return;
   
   countElement.textContent = Object.keys(aiRules).length;
   
   if (Object.keys(aiRules).length === 0) {
       container.innerHTML = '<div style="color: #666; text-align: center; padding: 10px;">추가된 EasyTalk AI 규칙이 없습니다.</div>';
       return;
   }
   
   container.innerHTML = Object.entries(aiRules)
       .map(([original, converted]) => `
           <div style="padding: 8px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
               <div>
                   <strong>${escapeHtml(original)}</strong> → ${escapeHtml(converted)}
               </div>
               <button onclick="deleteAIRule('${escapeHtml(original)}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">삭제</button>
           </div>
       `).join('');
}

function deleteAIRule(original) {
   if (!isAdmin) return;
   
   if (confirm(`"${original}" EasyTalk AI 규칙을 삭제하시겠습니까?`)) {
       const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
       delete aiRules[original];
       localStorage.setItem('easytalk_ai_custom_rules', JSON.stringify(aiRules));
       
       showAlert(`🗑️ EasyTalk AI 규칙 "${original}"이 삭제되었습니다.`, 'success');
       updateAIRulesList();
       updateAdminAIStatus();
       loadLearningActivity();
   }
}

// ========================================
// 받침 처리 함수
// ========================================

function hasJongseong(char) {
   if (!char || char.length !== 1) return false;
   const code = char.charCodeAt(0);
   
   if (code >= 0xAC00 && code <= 0xD7A3) {
       return (code - 0xAC00) % 28 !== 0;
   }
   
   if (/[0-9]/.test(char)) {
       const hasJongseongNums = ['1', '3', '6', '7', '8'];
       return hasJongseongNums.includes(char);
   }
   
   if (/[a-zA-Z]/.test(char)) {
       const hasJongseongLetters = ['l', 'm', 'n', 'r'];
       return hasJongseongLetters.includes(char.toLowerCase());
   }
   
   return false;
}

function smartWordReplace(text, original, replacement) {
   const escapedOriginal = escapeRegExp(original);
   
   const patterns = [
       {
           regex: new RegExp(`${escapedOriginal}을(\\s|$|[.!?])`, 'g'),
           replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}을$1` : `${replacement}를$1`
       },
       {
           regex: new RegExp(`${escapedOriginal}를(\\s|$|[.!?])`, 'g'),
           replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}을$1` : `${replacement}를$1`
       },
       {
           regex: new RegExp(`${escapedOriginal}은(\\s|$|[.!?])`, 'g'),
           replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}은$1` : `${replacement}는$1`
       },
       {
           regex: new RegExp(`${escapedOriginal}는(\\s|$|[.!?])`, 'g'),
           replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}은$1` : `${replacement}는$1`
       },
       {
           regex: new RegExp(`${escapedOriginal}이(\\s|$|[.!?])`, 'g'),
           replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}이$1` : `${replacement}가$1`
       },
       {
           regex: new RegExp(`${escapedOriginal}가(\\s|$|[.!?])`, 'g'),
           replacement: hasJongseong(replacement.slice(-1)) ? `${replacement}이$1` : `${replacement}가$1`
       },
       {
           regex: new RegExp(`${escapedOriginal}(?![을를은는이가와과에게서로부터의아야])`, 'g'),
           replacement: replacement
       }
   ];
   
   patterns.forEach(pattern => {
       text = text.replace(pattern.regex, pattern.replacement);
   });
   
   return text;
}

function escapeRegExp(string) {
   return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
   return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
}

// ========================================
// EasyTalk AI 핵심 변환 함수
// ========================================

function convertText() {
   const input = document.getElementById('textInput').value.trim();
   if (!input) {
       showAlert('변환할 텍스트를 입력해주세요.', 'warning');
       return;
   }
   
   console.log('🤖 EasyTalk AI 변환 시작:', input);
   
   // AI 분석 중 표시
   showAIAnalyzing();
   
   // EasyTalk AI처럼 약간의 분석 시간
   setTimeout(() => {
       const result = performEasyTalkConversion(input);
       createWordMappings(input, result);
       hideAIAnalyzing();
       showResult(input, result);
       updateStats();
       addToAIHistory(input, result);
       
       console.log('✅ EasyTalk AI 변환 완료:', result);
   }, 1200);
}

function showAIAnalyzing() {
   document.getElementById('aiAnalyzing').style.display = 'block';
}

function hideAIAnalyzing() {
   document.getElementById('aiAnalyzing').style.display = 'none';
}

function performEasyTalkConversion(text) {
   let converted = text;
   detectedDifficultWords = [];
   
   console.log('🧠 EasyTalk AI 분석 중...');
   
   // 1. 학습된 문장 우선 적용 (완전 일치)
   const learnedSentences = JSON.parse(localStorage.getItem('easytalk_learned_sentences') || '{}');
   if (learnedSentences[text]) {
       console.log('📚 학습된 문장 사용:', learnedSentences[text]);
       return learnedSentences[text];
   }
   
   // 2. 관리자 EasyTalk AI 규칙 적용
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   for (const [original, simple] of Object.entries(aiRules)) {
       if (converted.includes(original)) {
           converted = smartWordReplace(converted, original, simple);
           detectedDifficultWords.push({
               original: original,
               converted: simple,
               source: 'easytalk_admin'
           });
           console.log('🔴 관리자 AI 규칙 적용:', original, '→', simple);
       }
   }
   
   // 3. EasyTalk AI 어려운 단어 감지 및 변환
   const currentAIDictionary = easyTalkAI[aiDifficultyLevel] || {};
   for (const [original, simple] of Object.entries(currentAIDictionary)) {
       if (converted.includes(original)) {
           converted = smartWordReplace(converted, original, simple);
           detectedDifficultWords.push({
               original: original,
               converted: simple,
               source: 'easytalk_ai'
           });
           console.log('🤖 EasyTalk AI 감지:', original, '→', simple);
       }
   }
   
   // 4. 기본 변환 규칙 적용
   for (const [original, simple] of Object.entries(conversionRules)) {
       if (converted.includes(original)) {
           converted = smartWordReplace(converted, original, simple);
           detectedDifficultWords.push({
               original: original,
               converted: simple,
               source: 'basic'
           });
           console.log('📝 기본 규칙 적용:', original, '→', simple);
       }
   }
   
   // 5. EasyTalk AI: 문장 패턴 분석 및 존댓말 변환
   converted = analyzeAndConvertSentencePatterns(converted);
   
   // 6. EasyTalk AI: 문맥 분석
   converted = performContextAnalysis(converted);
   
   // AI 통계 업데이트
   aiStats.todayDetected += detectedDifficultWords.length;
   aiStats.autoConverted += detectedDifficultWords.filter(w => w.source === 'easytalk_ai').length;
   aiStats.totalConversions++;
   saveAIStats();
   
   console.log('🧠 EasyTalk AI 분석 완료! 감지된 어려운 단어:', detectedDifficultWords.length, '개');
   
   return converted;
}

function analyzeAndConvertSentencePatterns(text) {
   let result = text;
   
   const politePatterns = [
       { pattern: /(\w+)하십시오/g, replacement: '$1하세요' },
       { pattern: /(\w+)합니다/g, replacement: '$1해요' },
       { pattern: /(\w+)입니다/g, replacement: '$1이에요' },
       { pattern: /(\w+)됩니다/g, replacement: '$1돼요' },
       { pattern: /(\w+)습니다/g, replacement: '$1어요' },
       { pattern: /(\w+)드립니다/g, replacement: '$1드려요' },
       { pattern: /(\w+)받으십시오/g, replacement: '$1받으세요' },
       { pattern: /(\w+)주십시오/g, replacement: '$1주세요' },
       { pattern: /(\w+)바랍니다/g, replacement: '$1바라요' }
   ];
   
   politePatterns.forEach(({ pattern, replacement }) => {
       if (pattern.test(result)) {
           result = result.replace(pattern, replacement);
           console.log('🤖 EasyTalk AI 존댓말 패턴 변환:', pattern.source);
       }
   });
   
   return result;
}

function performContextAnalysis(text) {
   let result = text;
   
   const contextRules = [
       { 
           context: /병원|의료|진료|치료/,
           replacements: {
               "이용": "사용하기",
               "시설": "건물",
               "절차": "순서",
               "진료과": "진료하는 곳"
           }
       },
       {
           context: /교통|버스|지하철|택시/,
           replacements: {
               "노선": "길",
               "정류장": "버스 서는 곳",
               "승강장": "타는 곳",
               "요금": "돈"
           }
       },
       {
           context: /쇼핑|구매|매장|상점/,
           replacements: {
               "상품": "물건",
               "가격": "값",
               "할인": "싸게",
               "쿠폰": "할인권"
           }
       }
   ];
   
   contextRules.forEach(rule => {
       if (rule.context.test(result)) {
           for (const [original, simple] of Object.entries(rule.replacements)) {
               if (result.includes(original)) {
                   result = smartWordReplace(result, original, simple);
                   detectedDifficultWords.push({
                       original: original,
                       converted: simple,
                       source: 'context_ai'
                   });
                   console.log('🧠 EasyTalk AI 문맥 분석:', original, '→', simple);
               }
           }
       }
   });
   
   return result;
}

function createWordMappings(original, converted) {
   wordMappings = [];
   const originalWords = original.split(/\s+/);
   const convertedWords = converted.split(/\s+/);
   
   // AI 규칙들만 통합
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   const currentAIDictionary = easyTalkAI[aiDifficultyLevel] || {};
   const allRules = {...conversionRules, ...aiRules, ...currentAIDictionary};
   
   originalWords.forEach((originalWord, index) => {
       const convertedWord = convertedWords[index] || originalWord;
       const cleanOriginal = originalWord.replace(/[을를은는이가와과에게서로부터의아야,.!?]/g, '');
       const cleanConverted = convertedWord.replace(/[을를은는이가와과에게서로부터의아야,.!?]/g, '');
       
       let wasConverted = false;
       let appliedRule = null;
       
       for (const [ruleOriginal, ruleConverted] of Object.entries(allRules)) {
           if (cleanOriginal === ruleOriginal || originalWord.includes(ruleOriginal)) {
               wasConverted = true;
               appliedRule = {original: ruleOriginal, converted: ruleConverted};
               break;
           }
       }
       
       if (cleanOriginal.length >= 1 && /[가-힣]/.test(cleanOriginal)) {
           wordMappings.push({
               index: index,
               originalWord: originalWord,
               convertedWord: convertedWord,
               cleanOriginal: cleanOriginal,
               cleanConverted: cleanConverted,
               wasConverted: wasConverted,
               appliedRule: appliedRule
           });
       }
   });
   
   return wordMappings;
}

function showResult(original, converted) {
   document.getElementById('originalText').textContent = original;
   document.getElementById('convertedText').textContent = converted;
   document.getElementById('resultSection').style.display = 'block';
   
   currentResult = converted;
   currentOriginal = original;
   
   // AI 감지 단어 표시
   if (detectedDifficultWords.length > 0) {
       document.getElementById('aiDetectedWords').style.display = 'block';
       const detectedList = document.getElementById('detectedWordsList');
       
       const sourceLabels = {
           'easytalk_admin': '🔴 AI규칙',
           'easytalk_ai': '🤖 EasyTalk',
           'context_ai': '🧠 문맥AI',
           'basic': '📝 기본'
       };
       
       detectedList.innerHTML = detectedDifficultWords
           .map(word => `
               <span class="detected-word">
                   ${word.original} → ${word.converted}
                   <span style="font-size: 9px; opacity: 0.7;">(${sourceLabels[word.source]})</span>
               </span>
           `).join('');
   } else {
       document.getElementById('aiDetectedWords').style.display = 'none';
   }
   
   document.getElementById('resultSection').scrollIntoView({ 
       behavior: 'smooth',
       block: 'nearest'
   });
   
   setTimeout(() => speakText(), 800);
   updateAIStatus();
   updateAdminAIStatus();
}

// ========================================
// 음성 관련 함수들
// ========================================

function startRecording() {
   if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
       showAlert('음성 인식을 지원하지 않는 브라우저입니다. Chrome 브라우저를 사용해주세요.', 'error');
       return;
   }
   
   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
   const recognition = new SpeechRecognition();
   
   recognition.lang = 'ko-KR';
   recognition.continuous = false;
   recognition.interimResults = false;
   recognition.maxAlternatives = 1;
   
   const btn = document.getElementById('recordBtn');
   btn.classList.add('recording');
   
   recognition.onstart = function() {
       showAlert('🎤 음성 인식이 시작되었습니다. 말씀해주세요...', 'info');
   };
   
   recognition.onresult = function(event) {
       const text = event.results[0][0].transcript;
document.getElementById('textInput').value = text;
       showAlert(`✅ 음성 인식 완료: "${text}"`, 'success');
       
       setTimeout(() => convertText(), 500);
   };
   
   recognition.onend = function() {
       btn.classList.remove('recording');
   };
   
   recognition.onerror = function(event) {
       btn.classList.remove('recording');
       
       let errorMessage = '음성 인식 오류가 발생했습니다.';
       switch(event.error) {
           case 'no-speech':
               errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
               break;
           case 'audio-capture':
               errorMessage = '마이크에 접근할 수 없습니다. 마이크 권한을 확인해주세요.';
               break;
           case 'not-allowed':
               errorMessage = '마이크 사용 권한이 거부되었습니다.';
               break;
       }
       showAlert(errorMessage, 'error');
   };
   
   recognition.start();
}

function speakText() {
   if (!currentResult) {
       showAlert('재생할 텍스트가 없습니다.', 'warning');
       return;
   }
   
   if ('speechSynthesis' in window) {
       window.speechSynthesis.cancel();
       
       const utterance = new SpeechSynthesisUtterance(currentResult);
       utterance.lang = 'ko-KR';
       utterance.rate = 0.8;
       utterance.pitch = 1.0;
       utterance.volume = 1.0;
       
       utterance.onstart = function() {
           showAlert('🔊 EasyTalk 음성을 재생합니다...', 'info');
       };
       
       utterance.onend = function() {
           console.log('음성 재생 완료');
       };
       
       utterance.onerror = function(event) {
           showAlert('음성 재생 중 오류가 발생했습니다.', 'error');
       };
       
       window.speechSynthesis.speak(utterance);
   } else {
       showAlert('이 브라우저는 음성 출력을 지원하지 않습니다.', 'error');
   }
}

function copyResult() {
   if (!currentResult) {
       showAlert('복사할 내용이 없습니다.', 'warning');
       return;
   }
   
   navigator.clipboard.writeText(currentResult).then(() => {
       showAlert('📋 EasyTalk 변환 결과가 클립보드에 복사되었습니다!', 'success');
   }).catch(() => {
       const textarea = document.createElement('textarea');
       textarea.value = currentResult;
       document.body.appendChild(textarea);
       textarea.select();
       document.execCommand('copy');
       document.body.removeChild(textarea);
       showAlert('📋 EasyTalk 변환 결과가 복사되었습니다!', 'success');
   });
}

function clearInput() {
   document.getElementById('textInput').value = '';
   document.getElementById('resultSection').style.display = 'none';
   hideAIAnalyzing();
   hideFeedback();
   hideWordEdit();
   currentResult = '';
   currentOriginal = '';
   detectedDifficultWords = [];
   wordMappings = [];
   showAlert('🗑️ 입력이 지워졌습니다.', 'info');
}

// ========================================
// 피드백 관련 함수들
// ========================================

function showFeedback() {
   document.getElementById('feedbackSection').style.display = 'block';
   document.getElementById('feedbackSection').scrollIntoView({ 
       behavior: 'smooth',
       block: 'nearest'
   });
}

function hideFeedback() {
   document.getElementById('feedbackSection').style.display = 'none';
}

function giveFeedback(rating) {
   const feedbackMessages = {
       'excellent': '🌟 완벽하다는 평가 감사합니다! EasyTalk AI가 학습했습니다.',
       'good': '👍 좋다는 평가 감사합니다! EasyTalk AI가 학습했습니다.',
       'ok': '😐 보통이라는 평가 감사합니다. 더 똑똑한 EasyTalk AI로 발전하겠습니다.'
   };
   
   if (rating === 'excellent' || rating === 'good') {
       const learnedSentences = JSON.parse(localStorage.getItem('easytalk_learned_sentences') || '{}');
       learnedSentences[currentOriginal] = currentResult;
       localStorage.setItem('easytalk_learned_sentences', JSON.stringify(learnedSentences));
       
       aiStats.accuracy = Math.min(100, aiStats.accuracy + 1);
   } else if (rating === 'ok') {
       aiStats.accuracy = Math.max(0, aiStats.accuracy - 0.5);
   }
   
   saveAIStats();
   updateAIStatus();
   
   showAlert(feedbackMessages[rating] || '평가해주셔서 감사합니다.', 'success');
   hideFeedback();
   
   loadLearningActivity(); // 학습 활동 업데이트
   
   setTimeout(() => {
       clearInput();
       document.getElementById('textInput').focus();
   }, 1500);
}

// ========================================
// 단어별 수정 기능 (관리자만)
// ========================================

function showWordEdit() {
   if (!isAdmin) {
       showAlert('❌ 단어 수정은 관리자만 사용할 수 있습니다. 게스트는 사전 검색을 이용해주세요.', 'warning');
       return;
   }
   
   if (wordMappings.length === 0) {
       showAlert('수정할 단어가 없습니다. 먼저 텍스트를 변환해주세요.', 'warning');
       return;
   }
   
   hideFeedback();
   
   const wordEditGrid = document.getElementById('wordEditGrid');
   wordEditGrid.innerHTML = '';
   
   wordMappings.forEach((mapping, index) => {
       const editItem = document.createElement('div');
       editItem.className = 'word-edit-item';
       
       const statusClass = mapping.wasConverted ? 'status-converted' : 'status-unchanged';
       const statusText = mapping.wasConverted ? '✨ EasyTalk AI가 변환함' : '⚪ 변환되지 않음';
       const statusInfo = mapping.wasConverted && mapping.appliedRule ? 
           `(${mapping.appliedRule.original} → ${mapping.appliedRule.converted})` : '';
       
       editItem.innerHTML = `
           <div class="word-original-display">${mapping.originalWord}</div>
           <div class="word-conversion-row">
               <div class="word-arrow">→</div>
               <input type="text" class="word-edit-input" 
                      value="${mapping.convertedWord}" 
                      placeholder="관리자 수정"
                      data-index="${index}"
                      data-original="${mapping.cleanOriginal}">
           </div>
           <div class="word-status ${statusClass}">
               ${statusText}
               ${statusInfo ? `<div style="font-size: 10px; margin-top: 5px; opacity: 0.8;">${statusInfo}</div>` : ''}
           </div>
       `;
       
       wordEditGrid.appendChild(editItem);
   });
   
   document.getElementById('wordEditSection').style.display = 'block';
   document.getElementById('wordEditSection').scrollIntoView({ 
       behavior: 'smooth',
       block: 'nearest'
   });
   
   const firstInput = wordEditGrid.querySelector('.word-edit-input');
   if (firstInput) {
       setTimeout(() => firstInput.focus(), 300);
   }
}

function hideWordEdit() {
   document.getElementById('wordEditSection').style.display = 'none';
}

function resetWordEdits() {
   const inputs = document.querySelectorAll('.word-edit-input');
   inputs.forEach((input, index) => {
       const mapping = wordMappings[index];
       if (mapping) {
           input.value = mapping.convertedWord;
       }
   });
   showAlert('🔄 수정 내용이 원래대로 되돌려졌습니다.', 'info');
}

function saveWordEdits() {
   if (!isAdmin) {
       showAlert('❌ 관리자만 단어 수정을 저장할 수 있습니다.', 'error');
       return;
   }
   
   const inputs = document.querySelectorAll('.word-edit-input');
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   let hasChanges = false;
   let changedCount = 0;
   
   inputs.forEach((input, index) => {
       const mapping = wordMappings[index];
       const originalWord = mapping.cleanOriginal;
       const newConverted = input.value.trim();
       
       if (newConverted !== mapping.convertedWord && newConverted !== '') {
           const cleanConverted = newConverted.replace(/[을를은는이가와과에게서로부터의아야,.!?]/g, '');
           
           if (cleanConverted !== originalWord && cleanConverted !== '') {
               aiRules[originalWord] = cleanConverted;
               hasChanges = true;
               changedCount++;
           }
       }
   });
   
   if (hasChanges) {
       localStorage.setItem('easytalk_ai_custom_rules', JSON.stringify(aiRules));
       
       aiStats.accuracy = Math.min(100, aiStats.accuracy + changedCount);
       saveAIStats();
       
       const newResult = performEasyTalkConversion(currentOriginal);
       currentResult = newResult;
       document.getElementById('convertedText').textContent = currentResult;
       
       showAlert(`✨ ${changedCount}개 단어가 AI 규칙으로 추가되어 EasyTalk AI가 학습했습니다!`, 'success');
       
       setTimeout(() => speakText(), 1000);
       
       loadWords();
       updateAIRulesList();
       updateAIStatus();
   } else {
       showAlert('변경된 내용이 없습니다.', 'info');
   }
   
   hideWordEdit();
   
   setTimeout(() => {
       clearInput();
       document.getElementById('textInput').focus();
   }, 2000);
}

// ========================================
// AI 학습 현황 관리 (개인 단어 대체)
// ========================================

function loadWords() {
   loadLearningActivity();
   updateAdminAIStatus();
}

function loadLearningActivity() {
   const container = document.getElementById('learningActivity');
   const learnedSentences = JSON.parse(localStorage.getItem('easytalk_learned_sentences') || '{}');
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   
   if (!container) return;
   
   const totalLearning = Object.keys(learnedSentences).length + Object.keys(aiRules).length;
   
   if (totalLearning === 0) {
       container.innerHTML = `
           <div style="text-align: center; padding: 20px; color: #666;">
               <div style="font-size: 1.5rem; margin-bottom: 10px;">📈</div>
               <div>최근 EasyTalk 학습 활동이 없습니다.</div>
               <div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">
                   ${isAdmin ? 'AI 규칙을 추가하거나' : ''} 텍스트를 변환해보세요!
               </div>
           </div>
       `;
       return;
   }
   
   container.innerHTML = '';
   
   // 최근 AI 규칙 표시 (관리자만)
   if (isAdmin && Object.keys(aiRules).length > 0) {
       const recentRules = Object.entries(aiRules).slice(-3);
       recentRules.forEach(([original, converted]) => {
           const item = createLearningItem(original, converted, 'ai_rule');
           container.appendChild(item);
       });
   }
   
   // 최근 학습된 문장 표시 (최근 3개)
   const recentSentences = Object.entries(learnedSentences).slice(-3);
   recentSentences.forEach(([original, converted]) => {
       const item = createLearningItem(original, converted, 'learned');
       container.appendChild(item);
   });
}

function createLearningItem(original, converted, type) {
   const item = document.createElement('div');
   item.className = 'word-item';
   
   const typeConfig = {
       'ai_rule': { icon: '🤖', label: 'AI 규칙', color: '#dc2626' },
       'learned': { icon: '🧠', label: 'AI 학습', color: '#059669' }
   };
   
   const config = typeConfig[type] || typeConfig['learned'];
   
   // 긴 텍스트 줄임 처리
   const displayOriginal = original.length > 15 ? original.substring(0, 15) + '...' : original;
   const displayConverted = converted.length > 15 ? converted.substring(0, 15) + '...' : converted;
   
   item.innerHTML = `
       <div>
           <div style="font-size: 10px; color: ${config.color}; margin-bottom: 3px; font-weight: 600;">
               ${config.icon} ${config.label}
           </div>
           <div><strong>${displayOriginal}</strong> → ${displayConverted}</div>
       </div>
       <div style="font-size: 10px; color: #64748b;">
           최근 학습
       </div>
   `;
   
   return item;
}

function updateAdminAIStatus() {
   if (!isAdmin) return;
   
   const levels = { 1: '기본', 2: '보통', 3: '고급' };
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   
   // 관리자 AI 상태 업데이트
   const levelElement = document.getElementById('adminAiLevel');
   const ruleCountElement = document.getElementById('adminRuleCount');
   const todayCountElement = document.getElementById('adminTodayCount');
   const accuracyElement = document.getElementById('adminAccuracy');
   
   if (levelElement) levelElement.textContent = levels[aiDifficultyLevel] || '보통';
   if (ruleCountElement) ruleCountElement.textContent = Object.keys(aiRules).length;
   if (todayCountElement) todayCountElement.textContent = aiStats.todayDetected;
   if (accuracyElement) accuracyElement.textContent = Math.round(aiStats.accuracy);
}

// ========================================
// AI 상태 및 통계 관리
// ========================================

function updateAIStatus() {
   const levels = { 1: '기본', 2: '보통', 3: '고급' };
   
   const todayCountElement = document.getElementById('todayDetectedCount');
   const autoCountElement = document.getElementById('autoConvertCount');
   const levelElement = document.getElementById('currentDifficultyLevel');
   const accuracyElement = document.getElementById('accuracyRate');
   
   if (todayCountElement) todayCountElement.textContent = aiStats.todayDetected;
   if (autoCountElement) autoCountElement.textContent = aiStats.autoConverted;
   if (levelElement) levelElement.textContent = levels[aiDifficultyLevel];
   if (accuracyElement) accuracyElement.textContent = Math.round(aiStats.accuracy);
}

function saveAIStats() {
   localStorage.setItem('easytalk_ai_stats', JSON.stringify(aiStats));
}

function updateStats() {
   const learnedSentences = JSON.parse(localStorage.getItem('easytalk_learned_sentences') || '{}');
   const aiRules = JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}');
   
   const container = document.getElementById('statsContainer');
   if (!container) return;
   
   container.innerHTML = `
       <div class="stat-card">
           <div class="stat-number">${aiStats.totalConversions}</div>
           <div class="stat-label">총 변환</div>
       </div>
       <div class="stat-card">
           <div class="stat-number">${isAdmin ? Object.keys(aiRules).length : Object.keys(learnedSentences).length}</div>
           <div class="stat-label">${isAdmin ? 'AI 규칙' : 'AI 학습'}</div>
       </div>
       <div class="stat-card">
           <div class="stat-number">${Object.keys(learnedSentences).length}</div>
           <div class="stat-label">학습 문장</div>
       </div>
       <div class="stat-card">
           <div class="stat-number">${aiStats.todayDetected}</div>
           <div class="stat-label">감지 단어</div>
       </div>
       <div class="stat-card">
           <div class="stat-number">${aiStats.autoConverted}</div>
           <div class="stat-label">AI 변환</div>
       </div>
       <div class="stat-card">
           <div class="stat-number">${Math.round(aiStats.accuracy)}%</div>
           <div class="stat-label">AI 정확도</div>
       </div>
   `;
}

function addToAIHistory(original, converted) {
   const history = JSON.parse(localStorage.getItem('easytalk_ai_history') || '[]');
   
   history.unshift({
       original: original,
       converted: converted,
       detectedWords: detectedDifficultWords.length,
       timestamp: new Date().toISOString(),
       user: currentUser,
       aiLevel: aiDifficultyLevel,
       userType: isAdmin ? 'admin' : 'guest'
   });
   
   // 최근 30개만 유지
   if (history.length > 30) {
       history.splice(30);
   }
   
   localStorage.setItem('easytalk_ai_history', JSON.stringify(history));
   loadAIHistory();
}

function loadAIHistory() {
   const history = JSON.parse(localStorage.getItem('easytalk_ai_history') || '[]');
   const container = document.getElementById('aiHistory');
   
   if (!container) return;
   
   if (history.length === 0) {
       container.innerHTML = `
           <div style="text-align: center; padding: 20px; color: #666;">
               EasyTalk 변환 기록이 없습니다.
           </div>
       `;
       return;
   }
   
   container.innerHTML = '';
   
   history.slice(0, 10).forEach(item => {
       const historyItem = document.createElement('div');
       historyItem.className = 'word-item';
       
       const date = new Date(item.timestamp).toLocaleString('ko-KR', {
           month: 'short',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
       });
       
       const displayOriginal = item.original.length > 20 ? item.original.substring(0, 20) + '...' : item.original;
       const displayConverted = item.converted.length > 20 ? item.converted.substring(0, 20) + '...' : item.converted;
       
       const levels = { 1: '기본', 2: '보통', 3: '고급' };
       const levelText = levels[item.aiLevel] || '보통';
       const userIcon = item.userType === 'admin' ? '🔴' : '👤';
       
       historyItem.innerHTML = `
           <div>
               <div style="font-size: 10px; color: #666; margin-bottom: 3px;">
                   🤖 ${date} | ${item.detectedWords}개 감지 | ${levelText} AI | ${userIcon} ${item.user}
               </div>
               <div style="font-size: 12px;">
                   <div style="margin-bottom: 2px;"><strong>원본:</strong> ${displayOriginal}</div>
                   <div style="color: #059669;"><strong>변환:</strong> ${displayConverted}</div>
               </div>
           </div>
       `;
       
       container.appendChild(historyItem);
   });
}

function clearAIHistory() {
   if (confirm('모든 EasyTalk 변환 히스토리를 삭제하시겠습니까?')) {
       localStorage.removeItem('easytalk_ai_history');
       showAlert('🗑️ EasyTalk 히스토리가 모두 삭제되었습니다.', 'success');
       loadAIHistory();
   }
}

// ========================================
// 데이터 관리 함수들
// ========================================

function exportData() {
   const userType = isAdmin ? 'admin' : 'guest';
   const allData = {
       learnedSentences: JSON.parse(localStorage.getItem('easytalk_learned_sentences') || '{}'),
       aiCustomRules: isAdmin ? JSON.parse(localStorage.getItem('easytalk_ai_custom_rules') || '{}') : 'admin_only',
       aiStats: JSON.parse(localStorage.getItem('easytalk_ai_stats') || '{}'),
       aiHistory: JSON.parse(localStorage.getItem('easytalk_ai_history') || '[]'),
       difficultyLevel: aiDifficultyLevel,
       exportDate: new Date().toISOString(),
       version: 'EasyTalk_v1.1',
       user: currentUser,
       userType: userType
   };
   
   const blob = new Blob([JSON.stringify(allData, null, 2)], {type: 'application/json'});
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.download = `easytalk_backup_${currentUser}_${new Date().toISOString().slice(0, 10)}.json`;
   link.click();
   
   showAlert('📤 EasyTalk 데이터가 성공적으로 백업되었습니다!', 'success');
}

function resetAllData() {
   const userType = isAdmin ? '관리자' : '게스트';
   const confirmation = prompt(
       `정말로 ${userType} 데이터를 모두 삭제하시겠습니까?\n\n삭제될 데이터:\n• EasyTalk AI 학습 데이터\n• 변환 히스토리\n• 사용 통계${isAdmin ? '\n• AI 규칙' : ''}\n\n삭제하려면 "삭제"를 입력하세요:`
   );
   
   if (confirmation !== '삭제') {
       showAlert('삭제가 취소되었습니다.', 'info');
       return;
   }
   
   // 데이터 삭제
   const keysToRemove = [
       'easytalk_learned_sentences', 'easytalk_ai_stats', 
       'easytalk_ai_history', 'easytalk_ai_difficulty_level'
   ];
   
   if (isAdmin) {
       keysToRemove.push('easytalk_ai_custom_rules');
   }
   
   keysToRemove.forEach(key => localStorage.removeItem(key));
   
   // 전역 변수 초기화
   currentResult = '';
   currentOriginal = '';
   wordMappings = [];
   detectedDifficultWords = [];
   aiDifficultyLevel = 2;
   aiStats = {
       todayDetected: 0,
       autoConverted: 0,
       totalConversions: 0,
       accuracy: 100
   };
   
   showAlert(`🗑️ ${userType} EasyTalk 데이터가 완전히 삭제되었습니다.`, 'success');
   
   loadAllData();
}

// ========================================
// 유틸리티 함수
// ========================================

function showAlert(message, type = 'info') {
   const existingAlert = document.querySelector('.alert');
   if (existingAlert) {
       existingAlert.remove();
   }
   
   const alert = document.createElement('div');
   alert.className = `alert alert-${type}`;
   alert.textContent = message;
   
   document.body.appendChild(alert);
   
   const duration = type === 'error' ? 5000 : type === 'warning' ? 4000 : 3000;
   setTimeout(() => {
       if (alert.parentNode) {
           alert.style.animation = 'slideIn 0.3s ease reverse';
           setTimeout(() => alert.remove(), 300);
       }
   }, duration);
}

// ========================================
// 완료 로그
// ========================================

console.log('✅ EasyTalk - 쉬운 말 변환 커뮤니케이션 애플리케이션 완성!');
console.log('🎤 주요 기능:');
console.log('  • 관리자: EASY TALK / 1234 (AI 규칙 관리, 단어 수정)');
console.log('  • 게스트: guest / guest123 (진짜 사전, 단어 테스트)');
console.log('  • EasyTalk AI: 3000+ 어려운 단어 자동 감지');
console.log('  • 진짜 한국어 사전: 19개 단어 완전 설명');
console.log('  • 단어 뜻 테스트: 4지 선다 퀴즈');
console.log('🚀 테스트: "협조 부탁드립니다 서류를 제출해 주시기 바랍니다"');
console.log('📖 사전 테스트: "확인" 검색 → 테스트하기');
