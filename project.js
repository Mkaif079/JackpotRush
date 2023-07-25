const readline = require('readline');

const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
  A: 2,
  B: 4,
  C: 6,
  D: 8,
};

const SYMBOL_VALUES = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const deposit = () => {
  return new Promise((resolve) => {
    rl.question('Enter a deposit amount: ', (depositAmount) => {
      const numberDepositAmount = parseFloat(depositAmount);

      if (isNaN(numberDepositAmount) || numberDepositAmount <= 0) {
        console.log('Invalid deposit amount, try again.');
        resolve(deposit());
      } else {
        resolve(numberDepositAmount);
      }
    });
  });
};

const getNumberOfLines = () => {
  return new Promise((resolve) => {
    rl.question('Enter the number of lines to bet on (1-3): ', (lines) => {
      const numberOfLines = parseFloat(lines);

      if (isNaN(numberOfLines) || numberOfLines <= 0 || numberOfLines > 3) {
        console.log('Invalid number of lines, try again.');
        resolve(getNumberOfLines());
      } else {
        resolve(numberOfLines);
      }
    });
  });
};

const getBet = (balance, lines) => {
  return new Promise((resolve) => {
    rl.question('Enter the bet per line: ', (bet) => {
      const numberBet = parseFloat(bet);

      if (isNaN(numberBet) || numberBet <= 0 || numberBet > balance / lines) {
        console.log('Invalid bet, try again.');
        resolve(getBet(balance, lines));
      } else {
        resolve(numberBet);
      }
    });
  });
};

const spin = () => {
  const symbols = [];
  for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
    for (let i = 0; i < count; i++) {
      symbols.push(symbol);
    }
  }

  const reels = [];
  for (let i = 0; i < COLS; i++) {
    reels.push([]);
    const reelSymbols = [...symbols];
    for (let j = 0; j < ROWS; j++) {
      const randomIndex = Math.floor(Math.random() * reelSymbols.length);
      const selectedSymbol = reelSymbols[randomIndex];
      reels[i].push(selectedSymbol);
      reelSymbols.splice(randomIndex, 1);
    }
  }

  return reels;
};

const transpose = (reels) => {
  const rows = [];

  for (let i = 0; i < ROWS; i++) {
    rows.push([]);
    for (let j = 0; j < COLS; j++) {
      rows[i].push(reels[j][i]);
    }
  }

  return rows;
};

const printRows = (rows) => {
  for (const row of rows) {
    let rowString = '';
    for (const [i, symbol] of row.entries()) {
      rowString += symbol;
      if (i != row.length - 1) {
        rowString += ' | ';
      }
    }
    console.log(rowString);
  }
};

const getWinnings = (rows, bet, lines) => {
  let winnings = 0;

  for (let row = 0; row < lines; row++) {
    const symbols = rows[row];
    let allSame = true;

    for (const symbol of symbols) {
      if (symbol != symbols[0]) {
        allSame = false;
        break;
      }
    }

    if (allSame) {
      winnings += bet * SYMBOL_VALUES[symbols[0]];
    }
  }

  return winnings;
};

const game = async () => {
  let balance = await deposit();

  while (true) {
    console.log('You have a balance of $' + balance);
    const numberOfLines = await getNumberOfLines();
    const bet = await getBet(balance, numberOfLines);
    balance -= bet * numberOfLines;
    const reels = spin();
    const rows = transpose(reels);
    printRows(rows);
    const winnings = getWinnings(rows, bet, numberOfLines);
    balance += winnings;
    console.log('You won, $' + winnings.toString());

    if (balance <= 0) {
      console.log('You ran out of money!');
      break;
    }

    const playAgain = await new Promise((resolve) => {
      rl.question('Do you want to play again (y/n)? ', (answer) => {
        resolve(answer.toLowerCase());
      });
    });

    if (playAgain !== 'y') break;
  }

  rl.close();
};

game();
