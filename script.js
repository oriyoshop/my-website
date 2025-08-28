// Elements
const eqEl=document.getElementById('equation'),
      answerEl=document.getElementById('answer'),
      feedbackEl=document.getElementById('feedback'),
      scoreEl=document.getElementById('score'),
      streakEl=document.getElementById('streak'),
      accuracyEl=document.getElementById('accuracy'),
      speedEl=document.getElementById('speed'),
      barEl=document.getElementById('bar'),
      timeTextEl=document.getElementById('timeText'),
      startBtn=document.getElementById('startBtn'),
      stopBtn=document.getElementById('stopBtn'),
      submitBtn=document.getElementById('submitBtn'),
      skipBtn=document.getElementById('skipBtn'),
      difficultyEl=document.getElementById('difficulty'),
      durationEl=document.getElementById('duration'),
      negativesEl=document.getElementById('negatives'),
      langEl=document.getElementById('lang'),
      themeBtn=document.querySelector('.theme-toggle');

let timer=null, timeLeft=0, totalTime=0, solved=0, attempted=0, streak=0, startedAt=0;
let currentOp=['+','-','*','/'], currentAnswer=0, currentLang='ru', theme='light';

// Sounds
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

// Multilang dictionary
const dict={ /* Ту қоидаҳои қаблӣ монанд */ 
  ru:{title:"Ментальная арифметика",subtitle:"Тренируйся быстро решать примеры. Выбери режим, нажми «Старт» и вперед!",diff:"Сложность",ops:"Операции",dur:"Длительность",neg:"Отрицательные ответы",negNo:"Нет",negYes:"Да",start:"Старт",stop:"Стоп",eqStart:"Нажмите «Старт»",ph:"Ваш ответ",ans:"Ответ ↵",skip:"Пропустить",solved:"Решено",streak:"Серия",acc:"Точность",speed:"пример/мин",footer:"Совет: Enter — ответ, Shift+Enter — пропуск",correct:"Верно!",wrong:a=>`Неверно. Правильный ответ: ${a}`,skipMsg:a=>`Пропущено. Правильный ответ: ${a}`,timeup:(s,a,acc)=>`Время вышло! ${s} из ${a} (${acc}%).`,stopped:(s,a,acc)=>`Остановлено. ${s}/${a} (${acc}%).`,round:"Раунд завершён"}
  // ... дигар забонҳо монанд ба қаблӣ
};

// Apply language
function applyLang(l){
  const t=dict[l]; currentLang=l;
  document.getElementById("title").textContent=t.title;
  document.getElementById("subtitle").textContent=t.subtitle;
  document.getElementById("lblDiff").textContent=t.diff;
  document.getElementById("lblOps").textContent=t.ops;
  document.getElementById("lblDur").textContent=t.dur;
  document.getElementById("lblNeg").textContent=t.neg;
  negativesEl.options[0].textContent=t.negNo;
  negativesEl.options[1].textContent=t.negYes;
  startBtn.textContent=t.start; stopBtn.textContent=t.stop;
  eqEl.textContent=t.eqStart;
  answerEl.placeholder=t.ph;
  submitBtn.textContent=t.ans; skipBtn.textContent=t.skip;
  document.getElementById("lblSolved").textContent=t.solved;
  document.getElementById("lblStreak").textContent=t.streak;
  document.getElementById("lblAcc").textContent=t.acc;
  document.getElementById("lblSpeed").textContent=t.speed;
  document.getElementById("footer").textContent=t.footer;
}
langEl.addEventListener("change",e=>applyLang(e.target.value));
applyLang("ru");

// Theme toggle
themeBtn.addEventListener("click",()=>{
  theme = theme==='light'?'dark':'light';
  document.body.className = theme;
});

// Confetti
function launchConfetti(){
  const colors=['#4facfe','#1a73e8','#f87171','#ef4444','#16a34a'];
  for(let i=0;i<100;i++){
    const conf=document.createElement('div');
    conf.style.position='fixed';
    conf.style.width='6px'; conf.style.height='6px';
    conf.style.background=colors[Math.floor(Math.random()*colors.length)];
    conf.style.top=Math.random()*window.innerHeight+'px';
    conf.style.left=Math.random()*window.innerWidth+'px';
    conf.style.borderRadius='50%';
    conf.style.opacity='0.8';
    conf.style.transition='all 1s linear';
    document.body.appendChild(conf);
    setTimeout(()=>conf.remove(),1000);
  }
}

// Arithmetic logic
function getRandomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function generateExample(){
  const diff=difficultyEl.value, allowNeg=negativesEl.value==='yes';
  let min,max;
  if(diff==='easy'){min=1; max=10;}
  else if(diff==='medium'){min=5; max=50;}
  else{min=20; max=100;}
  const op=currentOp[Math.floor(Math.random()*currentOp.length)];
  let a=getRandomInt(min,max), b=getRandomInt(min,max);
  if(!allowNeg && op==='-'){if(a<b)[a,b]=[b,a];}
  if(op==='/'){b=b===0?1:b; a=a*b;}
  switch(op){
    case '+': currentAnswer=a+b; break;
    case '-': currentAnswer=a-b; break;
    case '*': currentAnswer=a*b; break;
    case '/': currentAnswer=a/b; break;
  }
  eqEl.textContent=`${a} ${op} ${b} = ?`;
}

// Timer
function updateTimer(){
  if(timeLeft<=0){stopGame(true); return;}
  timeLeft--;
  const pct=timeLeft/totalTime;
  barEl.style.transform=`scaleX(${pct})`;
  const min=Math.floor(timeLeft/60).toString().padStart(2,'0');
  const sec=(timeLeft%60).toString().padStart(2,'0');
  timeTextEl.textContent=`${min}:${sec}`;
}

// Start/Stop
function startGame(){
  solved=0; attempted=0; streak=0;
  startedAt=Date.now();
  currentOp=[];
  document.querySelectorAll('.ops input:checked').forEach(c=>currentOp.push(c.value));
  if(currentOp.length===0){alert("Выберите хотя бы одну операцию"); return;}
  totalTime=parseInt(durationEl.value); timeLeft=totalTime;
  startBtn.disabled=true; stopBtn.disabled=false;
  submitBtn.disabled=false; skipBtn.disabled=false; answerEl.disabled=false;
  generateExample(); answerEl.value=''; feedbackEl.textContent='';
  timer=setInterval(updateTimer,1000);
}
function stopGame(timeUp=false){
  clearInterval(timer);
  const t=dict[currentLang];
  const acc=attempted?Math.round(solved/attempted*100):0;
  eqEl.textContent=timeUp?t.timeup(solved,attempted,acc):t.stopped(solved,attempted,acc);
  startBtn.disabled=false; stopBtn.disabled=true;
  submitBtn.disabled=true; skipBtn.disabled=true; answerEl.disabled=true;
}

// Check/skip answers
function checkAnswer(){
  const val=parseFloat(answerEl.value);
  attempted++;
  if(val===currentAnswer){
    solved++; streak++;
    feedbackEl.textContent=dict[currentLang].correct;
    feedbackEl.className='feedback ok';
    launchConfetti();
    correctSound.play();
  }else{
    streak=0;
    feedbackEl.textContent=dict[currentLang].wrong(currentAnswer);
    feedbackEl.className='feedback bad';
    wrongSound.play();
  }
  updateStats(); generateExample(); answerEl.value='';
}
function skipAnswer(){
  attempted++; streak=0;
  feedbackEl.textContent=dict[currentLang].skipMsg(currentAnswer); feedbackEl.className='feedback muted';
  updateStats(); generateExample(); answerEl.value='';
}

// Stats
function updateStats(){
  scoreEl.textContent=solved;
  streakEl.textContent=streak;
  accuracyEl.textContent=attempted?Math.round(solved/attempted*100)+'%':'0%';
  const minutes=(Date.now()-startedAt)/60000;
  speedEl.textContent=minutes>0?(solved/minutes).toFixed(1):'0.0';
}

// Event listeners
startBtn.addEventListener('click',startGame);
stopBtn.addEventListener('click',()=>stopGame(false));
submitBtn.addEventListener('click',checkAnswer);
skipBtn.addEventListener('click',skipAnswer);
answerEl.addEventListener('keydown',e=>{
  if(e.key==='Enter' && !e.shiftKey){checkAnswer();}
  else if(e.key==='Enter' && e.shiftKey){skipAnswer();}
});
