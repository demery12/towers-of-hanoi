var width = 400,
  height = 350,
  bottom_padding = 40;

var color_mapping = {
  1: "#c5b0d5",
  2: "#9467bd",
  3: "#ff9896",
  4: "#d62728",
  5: "#98df8a",
  6: "#2ca02c",
  7: "#ffbb78",
  8: "#ff7f0e",
  9: "#aec7e8",
  10: "#1f77b4"
};

// will populate as we change n
var SOLUTIONS = {};

// GLOBAL
var n = 6;

var initial_tower = []
for (let i = n; i > 0; i--) {
  initial_tower.push(i);
}

var global_state = [initial_tower, [],
  []
];

var viz = d3.select(".viz")
  .attr("width", width)
  .attr("height", height);

var all_states = [global_state];

function solve_towers(state, n, from, to) {
  /**
  	This produces a list of all the states for a given n
  */
  // This 'other_dict' is how we figure out what peg is not current in use
  // The pegs are numbered 0, 1, 2, the combination of which has unique sums per pair
  // so I map sum to the unsued tower
  var other_dict = {
    1: 2,
    3: 0,
    2: 1
  };
  var other = other_dict[from + to];
  if (n == 1) {
    movee = state[from].pop();
    state[to].push(movee);
    all_states.push(JSON.parse(JSON.stringify(state)));
  } else {
    solve_towers(state, n - 1, from, other)
    movee = state[from].pop();
    state[to].push(movee);
    all_states.push(JSON.parse(JSON.stringify(state)));
    solve_towers(state, n - 1, other, to)
  }
}


function draw_towers(state) {
  var relative_width = 10;
  var viz = d3.select(".viz")
  // add the tower groups
  var groups = viz.selectAll('g').data(state);
  groups.exit().remove();
  var groups_entered = groups
    .enter()
    .append("g")
    .attr("transform", function(d, i) {
      return "translate(" + (i + 1) * (width / 4) + ", 0)"
    })

  var rect_data = groups.selectAll('rect')
    .data(function(d) {
      return d;
    });
  //remove rects that no longer exist
  rect_data.exit().remove();
  // update existing rects
  rect_data.attr("width", function(d, i) {
      return relative_width * d;
    }).attr("x", function(d, i) {
      return -(relative_width / 2) * d;
    })
    .attr("fill", d => color_mapping[d])
    .attr("y", function(d, i) {
      return height - (i * 30) - bottom_padding
    });
  // add new rects
  rect_data.enter()
    .append("rect")
    .attr("width", function(d, i) {
      return relative_width * d;
    })
    .attr("x", function(d, i) {
      return -(relative_width / 2) * d;
    })
    .attr("height", 30)
    .attr("fill", d => color_mapping[d])
    .attr("y", function(d, i) {
      return height - (i * 30) - bottom_padding
    });

}

draw_towers(global_state);

var cur_state = 0;

/** Listener functions and bindings */
function advance_state() {
  if (cur_state + 1 < all_states.length) {
    cur_state += 1;
    draw_towers(all_states[cur_state]);
  }
}

function previous_state() {
  if (cur_state > 0) {
    cur_state -= 1;
    draw_towers(all_states[cur_state]);
  }
}

function auto_complete_clicked() {
  function auto_complete() {
    if (cur_state + 1 < all_states.length) {
      advance_state();
    }
  }
  var auto_complete_interval = setInterval(auto_complete, 200);

  function switch_to_stop_button() {
    let stop = () => {
      clearInterval(auto_complete_interval);
      d3.select("#auto_complete_button")
      	.text("Finish")
        .on("click", auto_complete_clicked);
    }
    d3.select("#auto_complete_button").text("Stop").on("click", stop);
    d3.select("#num_blocks").on("change.stop", stop);
    d3.select("#next_button").on("click.stop", stop);
		d3.select("#prev_button").on("click.stop", stop);
    d3.select("#reset_button").on("click.stop", stop);
  }
  switch_to_stop_button();
}


function reset_state() {
  cur_state = 0;
  draw_towers(all_states[cur_state]);
}

function change_num() {
  SOLUTIONS[n] = {
    "cur_state": cur_state,
    "solution_states": all_states
  };

  n = +this.value;
  if (n in SOLUTIONS) {
    cur_state = SOLUTIONS[n].cur_state;
    all_states = SOLUTIONS[n].solution_states;
    draw_towers(all_states[cur_state]);
  } else {
    cur_state = 0;
    let new_initial_tower = [];

    for (let i = n; i > 0; i--) {
      new_initial_tower.push(i);
    }
    var new_initial_state = [new_initial_tower, [],
      []
    ];
    all_states = [new_initial_state];
    solve_towers(JSON.parse(JSON.stringify(new_initial_state)), n, 0, 2);
    draw_towers(all_states[cur_state]);
  }


}
d3.select("#next_button").on("click", advance_state);
d3.select("#prev_button").on("click", previous_state);
d3.select("#num_blocks").on("change", change_num);
d3.select("#auto_complete_button").on("click", auto_complete_clicked);
d3.select("#reset_button").on("click", reset_state);
solve_towers(JSON.parse(JSON.stringify(global_state)), n, 0, 2);

