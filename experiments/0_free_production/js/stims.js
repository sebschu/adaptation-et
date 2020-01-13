
var percentages = [0, 10, 25, 40, 50, 60, 75, 90, 100];

var combinations = [];

// equal gumball machines (except 2 empty ones, since that's confusing)
for (var i = 1; i < percentages.length; i++) {
    combinations.push([percentages[i], percentages[i]]);
}

// one gumball machine dispenses 0
for (var i = 1; i < percentages.length; i++) {
    combinations.push([percentages[0], percentages[i]]);
}

// one gumball machine dispenses all
for (var i = 1; i < percentages.length - 1; i++) {
    combinations.push([percentages[8], percentages[i]]);
}

// one gumball machine dispenses 60%
for (var i = 1; i < percentages.length - 1; i++) {
    if (i == 5) continue;
    combinations.push([percentages[5], percentages[i]]);
}

// one gumball machine dispenses 50%
for (var i = 1; i < percentages.length - 1; i++) {
    if (i == 4 || i == 5) continue;
    combinations.push([percentages[4], percentages[i]]);
}

// one gumball machine dispenses 40%
for (var i = 1; i < percentages.length - 1; i++) {
    if (i == 3 || i == 4 || i == 5) continue;
    combinations.push([percentages[3], percentages[i]]);
}


COLORS = ["orange", "blue"]