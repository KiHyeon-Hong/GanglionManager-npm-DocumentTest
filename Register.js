/*
  개인식별 서비스 개인식별 등록 모듈

  @author Gachon University, NAYUNTECH
  @version 1.0
  @개인식별 서비스 제공을 위한 개인식별 성능 고도화
*/

const fs = require('fs');


/*
  string 형태이며 쉼표(,)로 구분된 뇌파 데이터 파일을 float 형태의 배열로 분리하는 메소드

  @param var data : string 형태의 뇌파 데이터
  @return var myArray : float 형태의 뇌파 데이터 배열
  @exception 없음
*/
const parseEOG = (data) => {
  var myArray = data.split(',').map(function(item) {
      return parseFloat(item, 10);
  });

  return myArray;
}


/*
  float 뇌파 데이터 배열에서 눈 깜빡임 시작 지점, 중간 지점, 종료 지점을 추출하여 배열에 index 값 저장

  @param var data : float 형태의 뇌파 데이터 배열
  @param var start : 눈 깜빡임 시작 지점을 저장할 빈 배열
  @param var middle : 눈 깜빡임 중간 지점을 저장할 빈 배열
  @param var finish : 눈 깜박임 종료 지점을 저장할 빈 배열
  @return 없음
  @exception 없음
*/
const startMiddleFinishSplit = (data, start, middle, finish) => {
  var temp = 0;
  var index = 0;

  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  for(var i = 0; i < data.length; i++) {
    if(temp + json.delayTime < i && data[i] > json.blinkPoint) {
      for(var j = i; j >= 0; j--) {
        if(data[j] <= 0) {
          start[index] = j;
          break;
        }
      }

      for(var j = start[index] + 1; j < data.length; j++) {
        if(data[j] <= 0) {
          middle[index] = j;
          break;
        }
      }

      for(var j = middle[index] + 1; j < data.length; j++) {
        if(data[j] >= 0) {
          finish[index] = j;
          break;
        }
      }

      i = finish[index];
      index++;
      temp = i;
    }
  }
}


/*
  뇌파 데이터 배열과 start, middle. finish 지점을 통하여 개인식별을 위한 특징을 추출하는 메소드

  @param var data : float 형태의 뇌파 데이터 배열
  @param var start : 눈 깜빡임 시작 지점 인덱스 배열
  @param var middle : 눈 깜빡임 중간 지점 인덱스 배열
  @param var finish : 눈 깜박임 종료 지점 인덱스 배열
  @param var HP ~ RLPG : 개인식별을 위한 특징을 저장할 빈 배열들
  @return 없음
  @exception 없음
*/
const featureExtraction = (data, start, middle, finish, HP, LP, LHPL, LLPL, HPL, LPL, LHPG, LLPG, RHPG, RLPG) => {
  var index = 0;

  for(var i = start[0]; i < finish[finish.length - 1];) {
    HP[index] = 0;
    LP[index] = 0;

    for(var j = start[index]; j < finish[index]; j++) {
      if(HP[index] < data[j]) {
        HP[index] = data[j];
        LHPL[index] = j - start[index];
      }
    }

    for(var j = start[index]; j < finish[index]; j++) {
      if(LP[index] > data[j]) {
        LP[index] = data[j];
        LLPL[index] = j - middle[index];
      }
    }

    HPL[index] = middle[index] - start[index];
    LPL[index] = finish[index] - middle[index];

    LHPG[index] = HP[index] / LHPL[index];
    LLPG[index] = LP[index] / LLPL[index];
    RHPG[index] = HP[index] / (HPL[index] - LHPL[index]);
    RLPG[index] = LP[index] / (LPL[index] - LLPL[index]);

    index++;

    if(start.length == index) {
      break;
    }

    i = start[index];
  }
}


/*
  눈 깜빡임 지속 시간과 눈 깜빡임 사이의 시간을 측정하는 메소드

  @param var start : 눈 깜빡임 데이터 시작 지점 인덱스 배열
  @param var finish : 눈 깜빡임 데이터 종료 지점 인덱스 배열
  @param var blink : 눈 깜빡임 지속 시간을 저장할 빈 배열
  @param var notBlink : 눈 깜빡임 사이의 시간을 저장할 빈 배열
  @return 없음
  @exception 없음
*/
const blinkNotBlink = (start, finish, blink, notBlink) => {
  var blinkCheck = 0;
  var preBlinkCheck = 0;

  for(let i = 0; i < finish.length; i++){
    blink[i] = finish[i] - start[i];
  }

  blinkCheck = 0;
  preBlinkCheck = 0;

  for(let i = 0; i < finish.length - 1; i++){
    notBlink[i] = start[i + 1] - finish[i];
  }
}


/*
  개개인의 눈 깜빡임 특징에서 최솟값과 최댓값을 제거하여 개인의 좀 더 일반적인 특징을 추출하는 메소드

  @param var data : 개인식별 특징 배열
  @param var check : 최솟값 제거인지, 최댓값 제거인지 확인 변수(0 -> 최솟값 제거, 1 -> 최댓값 제거)
  @param var count : 최솟값 또는 최댓값 제거 개수
  @return var data : 치우친 경향이 제거된 개인식별 특징 배열
  @exception 없음
*/
const minMaxDelete = (data, check, count) => {
  if(check == 0){
    for(var i = 0; i < count; i++){
      var min = data.indexOf(Math.min.apply(null, data));
      data.splice(min, 1);
    }
  }
  else {
    for(var i = 0; i < count; i++){
      var max = data.indexOf(Math.max.apply(null, data));
      data.splice(max, 1);
    }
  }
  return data;
}


/*
  개인식별 특징을 이용하여 개인식별을 위한 token을 생성하는 메소드

  @param var HP ~ RLPG : 개인식별 특징 배열
  @param var blink : 눈 깜빡임 지속 시간 배열
  @param var notBlink : 눈 깜빡임 사이의 시간 배열
  @return var obj : 개인식별 특징을 이용하여 생성된 token json 데이터
  @exception 없음
*/
const tokenCreate = function(HP, LP, LHPL, LLPL, HPL, LPL, LHPG, LLPG, RHPG, RLPG, blink, notBlink) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  var minMaxCount = json.minMaxCount;

  HP = minMaxDelete(HP, 0, minMaxCount);
  LP = minMaxDelete(LP, 0, minMaxCount);
  LHPL = minMaxDelete(LHPL, 0, minMaxCount);
  LLPL = minMaxDelete(LLPL, 0, minMaxCount);
  HPL = minMaxDelete(HPL, 0, minMaxCount);
  LPL = minMaxDelete(LPL, 0, minMaxCount);
  LHPG = minMaxDelete(LHPG, 0, minMaxCount);
  LLPG = minMaxDelete(LLPG, 0, minMaxCount);
  RHPG = minMaxDelete(RHPG, 0, minMaxCount);
  RLPG = minMaxDelete(RLPG, 0, minMaxCount);
  blink = minMaxDelete(blink, 0, minMaxCount);
  notBlink = minMaxDelete(notBlink, 0, minMaxCount);

  HP = minMaxDelete(HP, 1, minMaxCount);
  LP = minMaxDelete(LP, 1, minMaxCount);
  LHPL = minMaxDelete(LHPL, 1, minMaxCount);
  LLPL = minMaxDelete(LLPL, 1, minMaxCount);
  HPL = minMaxDelete(HPL, 1, minMaxCount);
  LPL = minMaxDelete(LPL, 1, minMaxCount);
  LHPG = minMaxDelete(LHPG, 1, minMaxCount);
  LLPG = minMaxDelete(LLPG, 1, minMaxCount);
  RHPG = minMaxDelete(RHPG, 1, minMaxCount);
  RLPG = minMaxDelete(RLPG, 1, minMaxCount);
  blink = minMaxDelete(blink, 1, minMaxCount);
  notBlink = minMaxDelete(notBlink, 1, minMaxCount);

  var token;

  var tempHP = 0;
  var tempLP = 0;
  var tempLHPL = 0;
  var tempLLPL = 0;
  var tempHPL = 0;
  var tempLPL = 0;
  var tempLHPG = 0;
  var tempLLPG = 0;
  var tempRHPG = 0;
  var tempRLPG = 0;

  var tempBlink = 0;
  var tempNotBlink = 0;

  for(var i = 0; i < HP.length; i++) {
    tempHP += HP[i];
    tempLP += LP[i];
    tempLHPL += LHPL[i];
    tempLLPL += LLPL[i];
    tempHPL += HPL[i];
    tempLPL += LPL[i];
    tempLHPG += LHPG[i];
    tempLLPG += LLPG[i];
    tempRHPG += RHPG[i];
    tempRLPG += RLPG[i];
  }

  for(var i = 0; i < blink.length; i++) {
    tempBlink += blink[i];
  }

  for(var i = 0; i < notBlink.length; i++) {
    tempNotBlink += notBlink[i];
  }

  tempHP = tempHP / HP.length;
  tempLP = tempLP/  LP.length;
  tempLHPL = tempLHPL / LHPL.length;
  tempLLPL = tempLLPL / LLPL.length;
  tempHPL = tempHPL / HPL.length;;
  tempLPL = tempLPL / LPL.length;
  tempLHPG = tempLHPG / LHPG.length;
  tempLLPG = tempLLPG / LLPG.length;
  tempRHPG = tempRHPG / RHPG.length;
  tempRLPG = tempRLPG / RLPG.length;

  tempBlink = tempBlink / blink.length;
  tempNotBlink = tempNotBlink / notBlink.length;

  var obj = {'HP':tempHP, 'LP':tempLP, 'LHPL':tempLHPL, 'LLPL':tempLLPL, 'HPL':tempHPL, 'LPL':tempLPL, 'LHPG':tempLHPG, 'LLPG':tempLLPG, 'RHPG':tempRHPG, 'RLPG':tempRLPG, 'blink':tempBlink, 'notBlink':tempNotBlink};
  obj = JSON.stringify(obj);

  return obj;
}


/*
  사용자에게 제공되는 개인식별 등록 인터페이스

  @param var fp1 : 사용자의 fp1에서 측정한 뇌파 데이터
  @param var fp2 : 사용자의 fp2에서 측정한 뇌파 데이터
  @return 없음
  @exception 없음
*/
var register = function(fp1, fp2) {

  var fp1Array = parseEOG(fp1);
  var fp2Array = parseEOG(fp2);

  var fp1Start = [];
  var fp1Middle = [];
  var fp1Finish = [];

  var fp2Start = [];
  var fp2Middle = [];
  var fp2Finish = [];

  startMiddleFinishSplit(fp1Array, fp1Start, fp1Middle, fp1Finish);
  startMiddleFinishSplit(fp2Array, fp2Start, fp2Middle, fp2Finish);



  var fp1HP = [];
  var fp1LP = [];
  var fp1LHPL = [];
  var fp1LLPL = [];
  var fp1HPL = [];
  var fp1LPL = [];
  var fp1LHPG = [];
  var fp1LLPG = [];
  var fp1RHPG = [];
  var fp1RLPG = [];

  var fp2HP = [];
  var fp2LP = [];
  var fp2LHPL = [];
  var fp2LLPL = [];
  var fp2HPL = [];
  var fp2LPL = [];
  var fp2LHPG = [];
  var fp2LLPG = [];
  var fp2RHPG = [];
  var fp2RLPG = [];

  featureExtraction(fp1Array, fp1Start, fp1Middle, fp1Finish, fp1HP, fp1LP, fp1LHPL, fp1LLPL, fp1HPL, fp1LPL, fp1LHPG, fp1LLPG, fp1RHPG, fp1RLPG);
  featureExtraction(fp2Array, fp2Start, fp2Middle, fp2Finish, fp2HP, fp2LP, fp2LHPL, fp2LLPL, fp2HPL, fp2LPL, fp2LHPG, fp2LLPG, fp2RHPG, fp2RLPG);

  var fp1Blink = [];
  var fp2Blink = [];

  var fp1NotBlink = [];
  var fp2NotBlink = [];

  blinkNotBlink(fp1Start, fp1Finish, fp1Blink, fp1NotBlink);
  blinkNotBlink(fp2Start, fp2Finish, fp2Blink, fp2NotBlink);

  var token1 = tokenCreate(fp1HP, fp1LP, fp1LHPL, fp1LLPL, fp1HPL, fp1LPL, fp1LHPG, fp1LLPG, fp1RHPG, fp1RLPG, fp1Blink, fp1NotBlink);
  var token2 = tokenCreate(fp2HP, fp2LP, fp2LHPL, fp2LLPL, fp2HPL, fp2LPL, fp2LHPG, fp2LLPG, fp2RHPG, fp2RLPG, fp2Blink, fp2NotBlink);


  fs.writeFileSync('./files/data1.json', token1, 'utf8');
  fs.writeFileSync('./files/data2.json', token2, 'utf8');

  fs.writeFileSync('./data/dataCh2.txt', "", 'utf8');
  fs.writeFileSync('./data/dataCh3.txt', "", 'utf8');
}

exports.register = register;
