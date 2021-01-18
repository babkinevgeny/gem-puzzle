import HTMLGenerator from '../HTMLGenerator/HTMLGenerator';
import TimeCounter from '../TimeCounter/TimeCounter';

export default class Puzzle {
  constructor() {
    this.score = 0;
    this.puzzleWrapper = document.querySelector('#puzzle');
    this.progress = [];
    this.isEnabledAutoSolve = false;
    this.isEnabledSound = false;
  }

  start(settings) {
    let gameWasLoaded = false;
    if (settings) {
      this.size = settings.size;
      this.score = settings.score;
      this.progress = settings.progress;
      this.backgroundImage = settings.backgroundImage;
      this.timer = new TimeCounter(settings.totalSeconds);
      gameWasLoaded = true;
    } else {
      this.timer = new TimeCounter();
      this.size = +document.getElementById('size').value;
      this.score = 0;
      this.progress = [];
      this.backgroundImage = Puzzle.getRandomImagePath();
    }

    this.timer.startTimer();

    this.puzzleWrapper.innerHTML = '';

    const storeBtn = document.getElementById('store-btn');
    storeBtn.addEventListener('click', Puzzle.toggleRecords);

    this.navigation = document.getElementById('navigation');

    const records = document.getElementById('records');
    records.addEventListener('click', Puzzle.toggleRecords);

    this.init(gameWasLoaded);
  }

  init(gameWasLoaded = false) {
    this.isEnabledAutoSolve = false;
    this.puzzleWrapper.className = '';
    this.puzzleWrapper.classList.add('puzzle');
    this.puzzleWrapper.classList.add(`puzzle--size-${this.size}x${this.size}`);
    const countItems = this.size * this.size;

    for (let i = 0; i < countItems; i += 1) {
      const isEmpty = i + 1 === countItems;
      const item = this.createPuzzleItem(isEmpty, i + 1);
      this.puzzleWrapper.appendChild(item);
    }

    if (gameWasLoaded) {
      this.gameStarted = false;
      this.isMoveRecordEnabled = false;
      Puzzle.prepareLoadedPuzzle();
    } else {
      this.isMoveRecordEnabled = true;
      for (let j = 0; j < countItems * 1.5; j += 1) {
        this.gameStarted = false;
        Puzzle.clickRandomItemAroundEmpty();
      }
    }

    this.isMoveRecordEnabled = true;

    setTimeout(() => {
      const items = document.querySelectorAll('.puzzle__item');
      items.forEach((item) => {
        item.classList.add('puzzle__item--animation');
        item.addEventListener('click', Puzzle.checkPuzzle.bind(this));
      });
    }, 0);

    this.gameStarted = true;
    this.updateScore();

    const popup = document.getElementById('popup');
    popup.addEventListener('click', Puzzle.hidePopup);

    if (!localStorage.records) {
      this.constructor.generateStorage();
    }

    this.timer.stopTimer();
  }

  static getRandomImagePath() {
    const random = Math.floor(Math.random() * 150) + 1;
    return `url("./assets/images/${random}.jpg")`;
  }

  static getCurrentImagePath() {
    const styles = window.getComputedStyle(document.querySelector('.puzzle__item'));
    const temp = styles.backgroundImage.split('/');
    const tale = temp[temp.length - 1];
    return `url("./assets/images/${tale.slice(0, -2)}")`;
  }

  static clickRandomItemAroundEmpty() {
    const emptyItem = document.querySelector('.puzzle__item--empty');
    const [col, row] = Puzzle.getItemAttributes(emptyItem);
    const neededItemsCoords = [
      [col, row - 1],
      [col - 1, row],
      [col + 1, row],
      [col, row + 1],
    ];

    const items = [];

    neededItemsCoords.forEach((itemCoords) => {
      const item = document.querySelector(`.puzzle__item[data-column="${itemCoords[0]}"][data-row="${itemCoords[1]}"]`);

      if (item && item !== this.previousClickedItem) {
        items.push(item);
      }
    });

    const randomItem = items[Math.floor(Math.random() * items.length)];
    randomItem.click();
    this.previousClickedItem = randomItem;
  }

  createPuzzleItem(isEmpty, number) {
    const item = document.createElement('div');
    item.classList.add('puzzle__item');
    const newCol = (number - 1) % this.size;
    const newRow = Math.floor((number - 1) / this.size);

    item.setAttribute('data-column', newCol);
    item.setAttribute('data-row', newRow);
    item.setAttribute('draggable', true);
    item.style.backgroundImage = this.backgroundImage;
    item.style.backgroundPositionX = `${-newCol * 40}px`;
    item.style.backgroundPositionY = `${-newRow * 40}px`;

    if (isEmpty) {
      item.classList.add('puzzle__item--empty');
      item.setAttribute('data-number', '*');
      item.innerText = '';
      return item;
    }

    item.setAttribute('data-number', number);
    item.innerText = number;

    item.addEventListener('click', (event) => {
      const [col, row] = Puzzle.getItemAttributes(event.target);
      const isValidMove = Puzzle.getIndexOfReplacedItem({ col, row });

      if (isValidMove !== false) {
        this.movePuzzleItem(col, row);
        this.recordMove({ col, row, number });
        this.increaseScore();
        this.updateScore();
        this.playMoveSound();
      }
    });

    item.addEventListener('dragend', (event) => {
      event.target.click();
    });

    return item;
  }

  recordMove(item) {
    if (this.isMoveRecordEnabled) {
      this.progress.push({
        col: item.col,
        row: item.row,
        number: item.number,
      });
    }
  }

  static countPosition(itemInfo) {
    const styles = window.getComputedStyle(document.querySelector(`.puzzle__item[data-column="${itemInfo.col}"][data-row="${itemInfo.row}"]`));
    const currentTopPosition = parseInt(styles.top, 10);
    const currentLeftPosition = parseInt(styles.left, 10);

    const moveInfo = this.getMoveInfo(itemInfo);

    let newItemPosition;

    if (moveInfo) {
      if (moveInfo.direction === 'top') {
        newItemPosition = moveInfo.px + currentTopPosition;
      } else {
        newItemPosition = moveInfo.px + currentLeftPosition;
      }

      return {
        newItemPosition,
        direction: moveInfo.direction,
        col: moveInfo.col,
        row: moveInfo.row,
      };
    }

    return undefined;
  }

  movePuzzleItem(col, row) {
    const clickedItem = document.querySelector(`.puzzle__item[data-column="${col}"][data-row="${row}"]`);

    const clickedItemInfo = {
      col,
      row,
    };

    const moveClickedItemObj = this.constructor.countPosition(clickedItemInfo);

    if (moveClickedItemObj) {
      clickedItem.setAttribute('data-column', moveClickedItemObj.col);
      clickedItem.setAttribute('data-row', moveClickedItemObj.row);

      clickedItem.style[moveClickedItemObj.direction] = `${moveClickedItemObj.newItemPosition}px`;

      const emptyItem = document.querySelector('.puzzle__item--empty');

      emptyItem.setAttribute('data-column', col);
      emptyItem.setAttribute('data-row', row);
    }
  }

  static getValidItems(itemInfo) {
    return [
      [itemInfo.col, itemInfo.row - 1],
      [itemInfo.col - 1, itemInfo.row],
      [itemInfo.col + 1, itemInfo.row],
      [itemInfo.col, itemInfo.row + 1],
    ];
  }

  static getIndexOfReplacedItem(itemInfo) {
    const neededItemsCoords = Puzzle.getValidItems(itemInfo);

    for (let i = 0; i < neededItemsCoords.length; i += 1) {
      const emptyItem = document.querySelector(`.puzzle__item--empty[data-column="${neededItemsCoords[i][0]}"][data-row="${neededItemsCoords[i][1]}"]`);
      if (emptyItem) {
        return i;
      }
    }

    return false;
  }

  static getMoveInfo(itemInfo) {
    const indexOfReplacedItem = Puzzle.getIndexOfReplacedItem(itemInfo);
    let moveObj = {};

    if (typeof indexOfReplacedItem === 'number') {
      const emptyItem = document.querySelector('.puzzle__item--empty');
      const [col, row] = Puzzle.getItemAttributes(emptyItem);
      moveObj.col = col;
      moveObj.row = row;

      const itemSize = Puzzle.getPuzzleItemWidth();

      switch (indexOfReplacedItem) {
        case 0:
          moveObj.direction = 'top';
          moveObj.px = -itemSize;
          break;
        case 1:
          moveObj.direction = 'left';
          moveObj.px = -itemSize;
          break;
        case 2:
          moveObj.direction = 'left';
          moveObj.px = itemSize;
          break;
        case 3:
          moveObj.direction = 'top';
          moveObj.px = itemSize;
          break;
        default:
          moveObj = undefined;
      }
    }

    return moveObj;
  }

  static getPuzzleItemWidth() {
    const item = document.querySelector('.puzzle__item');
    const styles = window.getComputedStyle(item);
    return parseInt(styles.width, 10);
  }

  increaseScore() {
    if (this.gameStarted) {
      this.score += 1;
    }
  }

  updateScore() {
    const score = document.getElementById('score');
    score.innerText = this.score;
  }

  solvePuzzle() {
    if (this.isEnabledSound) {
      this.toggleSound();
    }

    this.isEnabledAutoSolve = true;
    this.gameStarted = false;
    this.constructor.toggleShadow();
    const progressCopy = [...this.progress];
    let timeout = 150;
    for (let i = progressCopy.length - 1; i >= 0; i -= 1) {
      const item = document.querySelector(`.puzzle__item[data-number="${progressCopy[i].number}"]`);

      setTimeout(() => {
        item.click();
      }, timeout);

      timeout += 150;
    }

    this.progress = [];

    setTimeout(() => {
      this.constructor.toggleShadow();
      this.clearProgress();
    }, timeout);
  }

  static toggleShadow() {
    const shadow = document.getElementById('shadow');
    shadow.classList.toggle('shadow--hidden');
  }

  clearProgress() {
    this.progress = [];
  }

  static getItemAttributes(item) {
    return [+item.getAttribute('data-column'), +item.getAttribute('data-row'), +item.getAttribute('data-number')];
  }

  static checkPuzzle() {
    if (this.isEnabledAutoSolve) {
      return;
    }
    const items = document.querySelectorAll('.puzzle__item');

    for (let i = 0; i < items.length - 1; i += 1) {
      const [col, row, number] = Puzzle.getItemAttributes(items[i]);
      const supposedCol = (number - 1) % this.size;
      const supposedRow = Math.floor((number - 1) / this.size);
      if (supposedRow !== row || supposedCol !== col) {
        return;
      }
    }
    Puzzle.showPopup();
    this.timer.stopTimer();
    this.clearProgress();
    this.saveRecords();
    Puzzle.updateRecords();
  }

  static showPopup() {
    const popup = document.getElementById('popup');
    const minutes = document.getElementById('minutes').innerText;
    const seconds = document.getElementById('seconds').innerText;
    const score = document.getElementById('score').innerText;
    const resultTime = document.getElementById('congrats-time');
    const resultScore = document.getElementById('congrats-score');

    resultScore.innerText = score;
    resultTime.innerText = `${minutes} : ${seconds}`;

    popup.classList.remove('popup--hidden');
  }

  static hidePopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('popup--hidden');
  }

  playMoveSound() {
    if (!this.isEnabledSound) {
      return;
    }

    const moveSound = document.querySelector('#moveSound');
    moveSound.play();
  }

  toggleSound() {
    this.isEnabledSound = !this.isEnabledSound;
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.classList.toggle('active');
  }

  static generateStorage() {
    const recordsStorage = {};

    for (let i = 3; i < 9; i += 1) {
      recordsStorage[`${i}x${i}`] = [];
    }

    localStorage.setItem('records', JSON.stringify(recordsStorage));
  }

  saveRecords() {
    const recordsStorage = JSON.parse(localStorage.getItem('records'));
    const path = `${this.size}x${this.size}`;
    recordsStorage[path].push(this.score);
    recordsStorage[path].sort();
    recordsStorage[path] = recordsStorage[path].filter((score, index) => index < 10);
    window.localStorage.setItem('records', JSON.stringify(recordsStorage));
  }

  static toggleRecords() {
    const records = document.getElementById('records');
    records.classList.toggle('records--hidden');
  }

  static updateRecords() {
    const records = document.getElementById('records');

    const newRecords = HTMLGenerator.createRecords();

    records.innerHTML = newRecords;
  }

  toggleMenu() {
    this.navigation.classList.toggle('navigation--hidden');
  }

  saveGame() {
    const gameSettings = {};
    gameSettings.progress = this.progress;
    gameSettings.size = this.size;
    gameSettings.score = this.score;

    const minutes = parseInt(document.getElementById('minutes').innerText, 10);
    const seconds = parseInt(document.getElementById('seconds').innerText, 10);

    gameSettings.totalSeconds = minutes * 60 + seconds;

    gameSettings.backgroundImage = Puzzle.getCurrentImagePath();

    localStorage.setItem('save', JSON.stringify(gameSettings));

    this.toggleMenu();

    const load = document.getElementById('load-btn');
    load.removeAttribute('disabled');
  }

  loadGame() {
    const gameSettings = JSON.parse(localStorage.save);
    if (gameSettings) {
      this.start(gameSettings);
    }

    this.toggleMenu();
  }

  static prepareLoadedPuzzle() {
    const gameSettings = JSON.parse(localStorage.save);
    this.isMoveRecordEnabled = false;

    for (let i = 0; i < gameSettings.progress.length; i += 1) {
      const item = document.querySelector(`.puzzle__item[data-number="${gameSettings.progress[i].number}"`);
      item.click();
    }

    this.isMoveRecordEnabled = true;
  }
}
