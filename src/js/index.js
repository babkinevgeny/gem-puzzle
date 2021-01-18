import Puzzle from './Puzzle/Puzzle';
import 'reset-css';
import '../scss/main.scss';
import TimeCounter from './TimeCounter/TimeCounter';
import HTMLGenerator from './HTMLGenerator/HTMLGenerator';

HTMLGenerator.createBasicHTML();

const timer = new TimeCounter();
const puzzle = new Puzzle(timer);
puzzle.start();
timer.startTimer();

const solveHandler = () => {
  puzzle.solvePuzzle();
  timer.stopTimer();
};

const menuHandler = () => {
  puzzle.toggleMenu();
};

const solve = document.getElementById('solve');
solve.addEventListener('click', solveHandler);
solve.addEventListener('click', menuHandler);

const startHandler = () => {
  puzzle.start();
  timer.startTimer();
};

const start = document.getElementById('start');
start.addEventListener('click', startHandler);
start.addEventListener('click', menuHandler);

const soundHandler = () => {
  puzzle.toggleSound();
};

const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', soundHandler);

const menuBtn = document.getElementById('menu-btn');
menuBtn.addEventListener('click', menuHandler);

const saveBtn = document.getElementById('save-btn');
saveBtn.addEventListener('click', puzzle.saveGame.bind(puzzle));

const loadBtn = document.getElementById('load-btn');
loadBtn.addEventListener('click', puzzle.loadGame.bind(puzzle));
