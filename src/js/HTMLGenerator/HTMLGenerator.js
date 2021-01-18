const moveSound = require('../../assets/sounds/move.mp3');

export default class HTMLGenerator {
  static createBasicHTML() {
    const basicHTML = `
      <header>
        <ul class="tracker">
          <li>
            <span>Time: </span>
            <span id="time">
              <span id="minutes">00</span> : 
              <span id="seconds">00</span>
            </span>
          </li>
          <li>
            <span>Score: </span>
            <span id="score"></span>
          </li>
        </ul>
        <nav id="navigation" class="navigation navigation--hidden">
          <ul class="navigation__list">
            <li class="navigation__item"> 
              <h3>Gem Puzzle</h3>
            </li>
            <li class="navigation__item"> 
              <span>Change size: </span>
              <select name="size" id="size">
                <option value="3">3</option>
                <option value="4" selected>4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </li>
            <li class="navigation__item">
              <button id="start">New Game</button>
            </li>
            <li class="navigation__item">
              <button id="save-btn">Save game</button>
            </li>
            <li class="navigation__item">
              ${HTMLGenerator.getLoadBtn()}
            </li>
            <li class="navigation__item">
              <button id="solve">Solve</button>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <section id="puzzle" class="puzzle"></section>
        <button class="switch sound" id="sound-btn"/>
        <button class="switch store" id="store-btn"/>
        <button class="switch menu" id="menu-btn"/>
      </main>
      <div id="shadow" class="shadow"></div>
      <section id="popup" class="popup popup--hidden">
        <h3>Congratulations! <br>You have solved puzzle for <span id="congrats-time"></span> and <span id="congrats-score"></span> turns</h3>
      </section>
      <section id="records" class="records records--hidden">
        
        ${HTMLGenerator.createRecords()}
      </section>
      <audio src="${moveSound.default}" id="moveSound"></audio>
    `;

    document.querySelector('body').innerHTML = basicHTML;
  }

  static getLoadBtn() {
    const btn = document.createElement('button');
    btn.setAttribute('id', 'load-btn');
    btn.innerText = 'Load last saved game';
    if (!localStorage.save) {
      btn.setAttribute('disabled', true);
    }

    return btn.outerHTML;
  }

  static createRecords() {
    const records = JSON.parse(localStorage.getItem('records'));
    if (!records) {
      return '<h3>There are no records. Win the game to be the first!</h3>';
    }

    const keys = Object.keys(records);

    const resultHTML = document.createElement('ul');
    const title = document.createElement('h3');
    title.innerText = 'Top 10 scores';

    keys.forEach((key) => {
      const li = document.createElement('li');
      const h4 = document.createElement('h4');
      h4.innerText = key;
      li.append(h4);

      if (records[key].length === 0) {
        const span = document.createElement('span');
        span.innerText = 'There are no records yet';
        li.append(span);
      } else {
        const ol = document.createElement('ol');
        records[key].forEach((result) => {
          const liRes = document.createElement('li');
          const tale = result === 1 ? 'move' : 'moves';
          liRes.innerText = `${result} ${tale}`;
          ol.append(liRes);
        });
        li.append(ol);
      }

      resultHTML.append(li);
    });

    return title.outerHTML + resultHTML.outerHTML;
  }
}
