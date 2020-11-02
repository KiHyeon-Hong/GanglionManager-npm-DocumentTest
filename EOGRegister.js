/*
  개인식별 서비스 제공을 위한 뇌파 데이터 측정 후 서비스 호출 과정

  @author Gachon University, NAYUNTECH
  @version 1.0
  @개인식별 서비스 제공을 위한 템플릿 작성
*/

const fs = require('fs');
const identification = require('./Identification.js');
const register = require('./Register.js');

var exec = require('child_process').exec;

/*
  뇌파 측정 후 개인 식별 서비스를 호출하기 위해 기능을 비동기식으로 호출한다

  @param 없음
  @return 없음
  @exception 없음
*/
const measurement = () => {
  exec('sudo node EOGMeasurement.js', function callback(error, stdout, stderr){
    main();
  });
}

/*
  뇌파 측정 종료 후 개인식별을 위한 등록 / 요청 기능 호출

  @param 없음
  @return 없음
  @exception 없음
*/
const main = () => {
  //측정한 뇌파 데이터 불러오기
  var fp1 = fs.readFileSync('./data/dataCh2.txt', 'utf8');
  var fp2 = fs.readFileSync('./data/dataCh3.txt', 'utf8');


  /*
    개인식별 서비스 호출

    @param var fp1 : fp1에서 측정한 뇌파 데이터, var fp2 : fp2에서 측정한 뇌파 데이터
    @return 개인식별 서비스 실행 결과 (true : 개인식별 결과 서비스 사용자, false : 개인식별 결과 서비스 사용자가 아님)
    @exception 없음
  */
  var result = register.register(fp1, fp2);

  //개인식별 서비스 결과 확인
  console.log(result);
}

measurement();
