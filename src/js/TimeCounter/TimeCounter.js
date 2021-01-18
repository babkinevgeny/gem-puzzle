export default class TimeCounter {
  constructor() {
    this.minutesElem = document.getElementById('minutes');
    this.secondsElem = document.getElementById('seconds');
  }

  startTimer(totalSeconds) {
    this.totalSeconds = totalSeconds || 0;
    this.stopTimer();

    this.minutesElem.innerHTML = this.totalSeconds ? TimeCounter.addZero(parseInt(this.totalSeconds / 60, 10)) : '00';
    this.secondsElem.innerHTML = this.totalSeconds ? TimeCounter.addZero(this.totalSeconds % 60) : '00';
    this.setTimeInterval = setInterval(this.setTime.bind(this), 1000);
  }

  getTime() {
    this.totalSeconds += 1;
    const seconds = TimeCounter.addZero(this.totalSeconds % 60);
    const minutes = TimeCounter.addZero(parseInt(this.totalSeconds / 60, 10));
    return [minutes, seconds];
  }

  static addZero(val) {
    const valString = `${val}`;
    return valString.length < 2 ? `0${valString}` : valString;
  }

  setTime() {
    const [minutes, seconds] = this.getTime();

    this.minutesElem.innerHTML = minutes;
    this.secondsElem.innerHTML = seconds;
  }

  stopTimer() {
    clearInterval(this.setTimeInterval);
  }
}
