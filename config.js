/*
  개인식별 서비스 제공을 위한 환경설정 상수 수정

  @author Gachon University, NAYUNTECH
  @version 1.0
  @뇌파 측정 시간을 위한 count 상수 변경 기능 추가
*/

const fs = require('fs');


/*
  register 기능으로 등록한 사용자 token과 식별 요청 token 비교 시 오차 최대 허용 범위인 identificationUp 변경 기능

  @param var data 변경하고 싶은 identificationUp 값 (범위 1.0이상의 실수)
  @return 없음
  @exception 없음
*/
var identificationUp = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":data,"identificationDown":json.identificationDown,"minMaxCount":json.minMaxCount,"blinkPoint":json.blinkPoint,"delayTime":json.delayTime,"EOGBlink":json.EOGBlink,"count":json.count};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}


/*
  register 기능으로 등록한 사용자 token과 식별 요청 token 비교 시 오차 최소 허용 범위인 identificationDown 변경 기능

  @param var data 변경하고 싶은 identificationDown 값  (범위 1.0 이하의 실수)
  @return 없음
  @exception 없음
*/
var identificationDown = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":json.identificationUp,"identificationDown":data,"minMaxCount":json.minMaxCount,"blinkPoint":json.blinkPoint,"delayTime":json.delayTime,"EOGBlink":json.EOGBlink,"count":json.count};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}


/*
  개인식별 시 눈 깜빡임 데이터 특징 중 최소값과 최댓값을 제거하여 예외로 두는 과정에서 몇개의 최소값과 최댓값을 제거할 것인지 결정하는 minMaxCount 변경 기능

  @param var data 변경하고 싶은 minMaxCount 값 (범위 0 이상의 정주)
  @return 없음
  @exception 없음
*/
var minMaxCount = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":json.identificationUp,"identificationDown":json.identificationDown,"minMaxCount":data,"blinkPoint":json.blinkPoint,"delayTime":json.delayTime,"EOGBlink":json.EOGBlink,"count":json.count};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}


/*
  뇌파 데이터에서 눈 깜박임 발생 시 값이 튀는 것을 감지하는데, 그 경계값인 blinkPoint 변경 기능

  @param var data 변경하고 싶은 blinkPoint 값 (범위 0 이상의 실수)
  @return 없음
  @exception 없음
*/
var blinkPoint = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":json.identificationUp,"identificationDown":json.identificationDown,"minMaxCount":json.minMaxCount,"blinkPoint":data,"delayTime":json.delayTime,"EOGBlink":json.EOGBlink,"count":json.count};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}


/*
  눈 깜빡임 데이터 후 발생하는 잡파를 눈 깜박임 데이터로 감지하지 않기 위해 일정 시간 감지를 중지하는데, 해당 증지 시간인 delayTime 변경 기능

  @param var data 변경하고 싶은 delayTime 값 (범위 0 이상의 정수)
  @return 없음
  @exception 없음
*/
var delayTime = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":json.identificationUp,"identificationDown":json.identificationDown,"minMaxCount":json.minMaxCount,"blinkPoint":json.blinkPoint,"delayTime":data,"EOGBlink":json.EOGBlink,"count":json.count};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}


/*
  뇌파 데이터 측정 시 잡파가 들어오면 매우 큰 값이 들어와 생체 데이터 수집을 방해한다. 따라서 일정 이상의 값이 들어오면 해당 데이터 수집을 중지 하는데 그 경계값을 나타내는 eogBlink 값 변경 기능

  @param var data 변경하고 싶은 eogBlink 값 (범위 0 이상의 정수)
  @return 없음
  @exception 없음
*/
var eogBlink = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":json.identificationUp,"identificationDown":json.identificationDown,"minMaxCount":json.minMaxCount,"blinkPoint":json.blinkPoint,"delayTime":json.delayTime,"EOGBlink":data,"count":json.count};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}


/*
  개인식별을 위한 뇌파 데이터 수집 시간 설정값인 count 변경 기능

  @param var data 변경하고 싶은 count 값 (범위 0 이상의 정수, count 1당 약 2초)
  @return 없음
  @exception 없음
*/
var count = function(data) {
  var json = fs.readFileSync('./config/config.json', 'utf8');
  json = JSON.parse(json);

  json = {"identificationUp":json.identificationUp,"identificationDown":json.identificationDown,"minMaxCount":json.minMaxCount,"blinkPoint":json.blinkPoint,"delayTime":json.delayTime,"EOGBlink":json.EOGBlink,"count":data};
  json = JSON.stringify(json);

  fs.writeFileSync('./config/config.json', json, 'utf8');
}

//모듈화
exports.identificationUp = identificationUp;
exports.identificationDown = identificationDown;
exports.minMaxCount = minMaxCount;
exports.blinkPoint = blinkPoint;
exports.delayTime = delayTime;
exports.eogBlink = eogBlink;
exports.count = count;
