var COLORS = ["blue", "orange"];


/*
 * Example stimulus: 
 *
 *  {
 *    "items": [
 *      {"image": "a.jpg",
 *       "percentage": 40,
 *       "color": "blue",
 *       "label": "target"},
 *      {"image": "b.jpg",
 *       "percentage": 60,
 *       "color": "orange",
 *       "label": "competitor"}
 *    ],
 *    "utterance_parts": [
 *      ["The machine dispensed", "prior"], 
 *      ["some of the", "quantifier"], 
 *      ["blue ones.", "color"]],
 *    "trial_info": {
 *      "block": 1,
 *      "trial": 1,
 *      "block_trial": 1,
 *      "type": "40_60",
 *      "init_images": ["orange.jpg", "blue.jpg"]
 *    }  
 *  }
 */



var stims = [];

var N_BLOCKS = 8;


var trials;

//some-biased condition

if (CONDITION == "some") {
  trials = [{
    "percentages": [25, 60],
    "quantifiers": ["some", "some"]
  }, {
    "percentages": [60, 90],
    "quantifiers": ["some", "most"]
  }, {
    "percentages": [90, 0],
    "quantifiers": ["most", "none"]

  }, {
    "percentages": [75, 100],
    "quantifiers": ["most", "all"]
  }];
} else if (CONDITION == "most") {
  trials = [{
    "percentages": [60, 90],
    "quantifiers": ["most", "most"]
  }, {
    "percentages": [25, 60],
    "quantifiers": ["some", "most"]
  }, {
    "percentages": [25, 100],
    "quantifiers": ["some", "all"]

  }, {
    "percentages": [40, 0],
    "quantifiers": ["some", "none"]
  }];
} else if (CONDITION == "many_some") {
  trials = [{
    "percentages": [25, 50],
    "quantifiers": ["some", "some"]
  }, {
    "percentages": [50, 90],
    "quantifiers": ["some", "many"]
  }, {
    "percentages": [90, 0],
    "quantifiers": ["many", "none"]

  }, {
    "percentages": [75, 100],
    "quantifiers": ["many", "all"]
  }];
} else if (CONDITION == "many_many") {
  trials = [{
    "percentages": [50, 90],
    "quantifiers": ["many", "many"]
  }, {
    "percentages": [25, 50],
    "quantifiers": ["some", "many"]
  }, {
    "percentages": [25, 100],
    "quantifiers": ["some", "all"]

  }, {
    "percentages": [40, 0],
    "quantifiers": ["some", "none"]
  }];
}

var n_trial = 1;

var all_none_trial = {
  "percentages": [0,100],
  "quantifiers": ["none", "all"]
}

var practice_stims = [];
for (var i = 0; i < 2; i++) {
  for (var j = 0; j < 2; j++) {
    var order = _.shuffle([0, 1]);
    var cols = _.shuffle(COLORS);
    var p1 = all_none_trial["percentages"][order[0]];
    var p2 = all_none_trial["percentages"][order[1]];
    
    var item = {
      "items": [{
        "image": "gumball_" + cols[0] + "_" + p1 + ".png",
        "percentage": p1,
        "color": cols[0],
        "label": order[0] == j ? "target" : "competitor"
      }, {
        "image": "gumball_" + cols[1] + "_" + p2 + ".png",
        "percentage": p2,
        "color": cols[1],
        "label": order[1] == j ? "target" : "competitor"
      }],
      "utterance_parts": [
        ["The machine dispensed " + all_none_trial["quantifiers"][j] + " of the", "quantifier"],
        [(order[0] == j ? cols[0] : cols[1]) + " ones.", "color"]
      ],
      "trial_info": {
        "block": 0,
        "type": all_none_trial["percentages"][0] + "_" + all_none_trial["percentages"][1] + "_" + (j + 1),
        "init_images": ["gumball_" + cols[0] + "_0.png", "gumball_" + cols[1] + "_0.png"],
        "quantifier": all_none_trial["quantifiers"][j]
      }
    }
    practice_stims.push(item);
  }
}


practice_stims = _.shuffle(practice_stims);
for (var i = 0; i < practice_stims.length; i++) {
  practice_stims[i]["trial_info"]["trial"] = n_trial++;
  practice_stims[i]["trial_info"]["block_trial"] = i + 1;
}
Array.prototype.push.apply(stims, practice_stims);



for (var block = 1; block <= N_BLOCKS; block++) {

  var block_stims = [];

  for (var i = 0; i < trials.length; i++) {
    var trial = trials[i];
    for (var j = 0; j < 2; j++) {
      var order = _.shuffle([0, 1]);
      var cols = _.shuffle(COLORS);
      var p1 = trial["percentages"][order[0]];
      var p2 = trial["percentages"][order[1]];

      var item = {
        "items": [{
          "image": "gumball_" + cols[0] + "_" + p1 + ".png",
          "percentage": p1,
          "color": cols[0],
          "label": order[0] == j ? "target" : "competitor"
        }, {
          "image": "gumball_" + cols[1] + "_" + p2 + ".png",
          "percentage": p2,
          "color": cols[1],
          "label": order[1] == j ? "target" : "competitor"
        }],
        "utterance_parts": [
          ["The machine dispensed " + trial["quantifiers"][j] + " of the", "quantifier"],
          [(order[0] == j ? cols[0] : cols[1]) + " ones.", "color"]
        ],
        "trial_info": {
          "block": block,
          "type": trial["percentages"][0] + "_" + trial["percentages"][1] + "_" + (j + 1),
          "init_images": ["gumball_" + cols[0] + "_0.png", "gumball_" + cols[1] + "_0.png"],
          "quantifier": trial["quantifiers"][j]
        }
      }
      block_stims.push(item);
    }
  }
  
  block_stims = _.shuffle(block_stims);
  for (var i = 0; i < block_stims.length; i++) {
    block_stims[i]["trial_info"]["trial"] = n_trial++;
    block_stims[i]["trial_info"]["block_trial"] = i + 1;
  }
  Array.prototype.push.apply(stims, block_stims);
}


//{
//  "items": [
//    {"image": "a.jpg",
//     "percentage": 40,
//     "color": "blue",
//     "label": "target"},
//    {"image": "b.jpg",
//     "percentage": 60,
//     "color": "orange",
//     "label": "competitor"}
//  ],
//  "utterance_parts": [
//    ["The machine dispensed", "prior"], 
//    ["some of the", "quantifier"], 
//    ["blue ones.", "color"]],
//  "trial_info": {
//    "block": 1,
//    "trial": 1,
//    "block_trial": 1,
//    "type": "40_60",
//    "init_images": ["orange.jpg", "blue.jpg"]
//  }  
//}
