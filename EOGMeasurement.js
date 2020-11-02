/*
  설정된 시간만큼 뇌파 데이터를 측정하고 잡파를 제거한 후 저장하는 프로그램
  뇌파 측정 시간 후 프로그램 종료

  @author Gachon University, NAYUNTECH
  @version 1.0
  @뇌파 데이터 append 시 발생하는 저장 오류 수정
*/

const gpio = require('node-wiring-pi');

//서비스 사용자에게 잡파가 섞인 데이터가 측정되면, 자세나 위치 수정 요청을 위해 LED를 ON/OFF
const LED = 29;
gpio.setup('wpi');
gpio.pinMode(LED, gpio.OUTPUT);


const {
    Ganglion
} = require('openbci-observable');
const eegPipes = require('@neurosity/pipes');
const fs = require("fs");


var json = fs.readFileSync('./config/config.json', 'utf8');
json = JSON.parse(json);
var EOGBlink = json.EOGBlink;


/*
  @param var flag : 잡파가 섞이지 않은 데이터 -> 0, 잡파가 섞인 데이터 -> 1
  @param var preFlag : 잡파가 섞이지 않은 데이터 -> 0, 잡파가 섞인 데이터 -> 1
  @param var count : 현재 뇌파 데이터 측정 시간 저장 변수
*/
var flag = 0;
var preFlag = 0;
var count = 0;

//뇌파 데이터 측정 전에 현재 파일에 기록되어 있는 데이터를 제거한다
fs.writeFileSync('./data/dataCh2.txt', "", 'utf8');
fs.writeFileSync('./data/dataCh3.txt', "", 'utf8');

/*
  Ganglion board와 연동 후 뇌파 데이터 측정 시작
  eegPipes를 통하여 뇌파 데이터 필터링
  필터링 후 뇌파 데이터 저장 (저장 위치 : ./data/)

  @param 없음
  @return 없음
  @exception 없음
*/
async function init() {
  const ganglion = new Ganglion({
    verbose: true,
    simulate: true
  });

  await ganglion.connect();
  await ganglion.start();

  ganglion.stream.pipe(

    eegPipes.voltsToMicrovolts(),

    eegPipes.addInfo({
      channels: ["null", "Fp2", "Fp1", "null"]
    }),

    eegPipes.epoch({
      duration: 400,interval:400
    }),

    eegPipes.notchFilter({
      nbChannels: 4,
      cutoffFrequency: 60
    }),

    eegPipes.bandpassFilter({
      nbChannels: 4,
      cutoffFrequencies: [1, 50]
    })

  ).subscribe(data => {

    //eegPipes로 데이터 필터링 후에도 강하게 측정되는 잡파 데이터를 제거하기 위해 일정 값 이상과 이하로 측정되면 뇌파 데이터 파일에 저장하지 않음
    for(let i = 0; i < data.data[1].length; i++) {
      if(data.data[1][i] > EOGBlink || data.data[1][i] < -EOGBlink || data.data[2][i] > EOGBlink || data.data[2][i] < -EOGBlink) {
        flag = 1;
        break;
      }
      else {
        flag = 0;
      }
    }

    if(flag == 0) {
      if((preFlag == 1) || (preFlag == 0 && count == 0)) {
        console.log('수면케어 안대 착용이 정상적입니다(데이터를 기록합니다).');
        gpio.digitalWrite(LED, 1);
      }
      preFlag = 0;

      fs.appendFile("./data/dataCh2.txt", data.data[1].toString(), 'utf8', function (error) {
        if (error) {
          console.log(error)
        }
      })
      fs.appendFile("./data/dataCh3.txt", data.data[2].toString(), 'utf8', function (error) {
        if (error) {
          console.log(error)
        }
      })
      count++;

      if(count <= json.count) {
        fs.appendFile("./data/dataCh2.txt", ',', 'utf8', function (error) {
          if (error) {
            console.log(error)
          }
        })
        fs.appendFile("./data/dataCh3.txt", ',', 'utf8', function (error) {
          if (error) {
            console.log(error)
          }
        })
      }
    }
    else {
      if(preFlag == 0) {
        console.log('수면케어 안대 착용이 비 정상적입니다(데이터를 기록하지 않습니다).');
        gpio.digitalWrite(LED, 0);
      }
      preFlag = 1;
    }
  })
}

init();

//뇌파 측정 시간을 김지하여 설정한 시간만큼 뇌파 데이터가 저장되면 뇌파 측정 서비스 종료
setInterval(() => {
  if(count > json.count) {
    gpio.digitalWrite(LED, 0);
    process.exit();
  }
}, 500);

process.on('exit', () => {
  gpio.digitalWrite(LED, 0);
  process.exit();
});
