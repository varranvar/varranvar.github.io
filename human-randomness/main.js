
const TAPE_SIZE = 20;
const N = 6;
const TRUE_SYMBOL = '🟓';
const FALSE_SYMBOL = ''


const user_tape_el = document.getElementById('user-tape');
const prediction_tape_el = document.getElementById('prediction-tape');
const prediction_rate_el = document.getElementById('prediction-rate');
const prediction_view_button = document.getElementById('prediction-view');

const user_tape = Array(TAPE_SIZE).fill(null);
const prediction_tape = Array(TAPE_SIZE).fill(null);

let prediction = false;
let model = new Map(JSON.parse(base_model));

let total = 0;
let correct = 0;
let prediction_shown = false;

// N-grams handling.

function update_model(inp) {
    let key = "";
    for(let s = 0; s < TAPE_SIZE; s++) {
        const val = user_tape[user_tape.length - s - 1];
        let char = "f";
        if(val == null) {
            char = "n";
        } else if (val) {
            char = "t";
        }
        key = char + key;

        if(!model.has(key)) model.set(key, [0, 0]);
        const domain = model.get(key);
        if(inp) {
            domain[0] += 1;
        } else {
            domain[1] += 1;
        }

    }
}

function predict() {
    prediction = null;
    let key = "";
    for(let s = 0; s < TAPE_SIZE; s++) {
        const val = user_tape[user_tape.length - s - 1];
        let char = "f";
        if(val == null) {
            char = "n";
        } else if (val) {
            char = "t";
        }
        key = char + key;

        const domain = model.get(key);
        if(domain != undefined) {
            if(domain[0] > domain[1]) {
                prediction = true;
            } else if (domain[0] != domain[1]) {
                prediction = false;
            }
        }
    }

    // Give a random prediction if there is no data.
    if(prediction == null) {
        prediction = false;
        if(Math.random() > 0.5) prediction = true;
    }
}
// UI handling.


function handle_user_input(inp) {
    total += 1;
    if(inp == prediction) correct += 1;
    prediction_rate_el.textContent = Math.round(100 * correct / total).toString() + "%";

    update_model(inp)

    user_tape.push(inp);
    user_tape.shift();

    prediction_tape.push(prediction);
    prediction_tape.shift();

    update_tapes();
    predict();
}

function update_tapes() {
    update_tape_element(user_tape, user_tape_el);
    //const inp_cell = document.createElement("div");
    //inp_cell.classList.add("cell");
    //inp_cell.classList.add("cell-inp");
    //user_tape_el.appendChild(inp_cell);

    update_tape_element(prediction_tape, prediction_tape_el);
    const prediction_cell = document.createElement("div");
    prediction_cell.classList.add("cell");
    if(!prediction_shown) prediction_cell.classList.add("cell-pred");
    else if (prediction) prediction_cell.classList.add("cell-filled");
    prediction_tape_el.appendChild(prediction_cell);
}

function update_tape_element(tape, el) {
    if(el) {
        el.innerHTML = '';
        for(let c of tape) {
            const child = document.createElement("div");
            child.classList.add("cell");
            if(c == null) {
                child.classList.add("cell-invisible");
            } else if (c) {
                child.classList.add("cell-filled");
            } 
            el.appendChild(child);
        }
    }
}

prediction_view_button.addEventListener('click', () => {
    prediction_shown = !prediction_shown;
    if(prediction_shown) {
        prediction_view_button.textContent = "Hide";
    } else {
        prediction_view_button.textContent = "Show";        
    }
    
    update_tapes();
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowLeft') {
    handle_user_input(true);
  } else if (event.key === 'ArrowRight') {
    handle_user_input(false);
  }
});

window.addEventListener('beforeunload', () => {
  //localStorage.setItem('model', JSON.stringify(Array.from(model.entries())));
});

window.addEventListener('load', () => {
  //const saved_model = localStorage.getItem('model');
  //if (saved_model && saved_model.length > base_model.length) {
  //  model = new Map(JSON.parse(saved_model));
  //}
});

update_tapes();