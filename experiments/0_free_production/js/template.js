var N_TRIALS = 15;


var cols = _.shuffle(COLORS);


function build_trials() {
    var trials = [];
    var selected_combinations = _.sample(combinations, N_TRIALS);
    for (var i = 0; i < N_TRIALS; i++) {
        var ps = _.shuffle(selected_combinations[i]);
        trials.push({
            "col1": cols[0],
            "col2": cols[1],
            "p1": ps[0],
            "p2": ps[1]
        });
    }
    return trials;
}



function make_slides(f) {
    var slides = {};

    slides.i0 = slide({
        name: "i0",
        start: function() {
            exp.startT = Date.now();
        }
    });



    slides.instructions = slide({
        name: "instructions",
        start: function() {
            $("#instructions-part2").hide();
            $("#instructions-part3").hide();
            $(".err").hide();
            this.step = 1;
        },
        button: function() {
            if (this.step == 1) {
                $("#instructions-part1").fadeOut(500, function() {
                    $("#instructions-part2").fadeIn(1000);
                });
                this.step = 2;
            } else if (this.step == 2) {
                $("#instructions-part2").fadeOut(500, function() {
                    $("#instructions-part3").fadeIn(1000);
                });
                this.step = 3;
            } else {
                var resp1 = $("#input-1-practice").val();
                var resp2 = $("#input-2-practice").val();
                if (resp1.length < 2 || resp2.length < 2) {
                    $(".err").show();
                } else {
                    exp.go();
                }
            }
        }
    });

    var present_handle_trial = function(stim) {
        $(".err").hide();
        $("#input-1").val('');
        $("#input-2").val('');

        $("#trial-part-1").show();
        $("#trial-part-2").hide();

        this.stim = stim;

        $("#gumball-machine-1").attr("src", "./stimuli/gumball_" + stim.col1 + "_0.png");
        $("#gumball-machine-2").attr("src", "./stimuli/gumball_" + stim.col2 + "_0.png");

        $("#col-1").text(stim.col1);
        $("#col-2").text(stim.col2);


        $("#trial").fadeIn(700, function() {});
    }




    var button_trial = function(response) {
        $(".err").hide();
        if (response == "dispense") {
            $("#gumball-machine-1").attr("src", "./stimuli/gumball_" + this.stim.col1 + "_" + this.stim.p1 + ".png");
            $("#gumball-machine-2").attr("src", "./stimuli/gumball_" + this.stim.col2 + "_" + this.stim.p2 + ".png");
            window.setTimeout(function() {
                $("#trial-part-1").fadeOut(300,
                    function() {
                        $("#trial-part-2").fadeIn(700, function() {});
                    });
            }, 2000);
        } else {
            this.resp1 = $("#input-1").val();
            this.resp2 = $("#input-2").val();
            if (this.resp1.length < 2 || this.resp2.length < 2) {
                $("#trial-part-2 .err").show();
            } else { 
                this.log_responses();
                var t = this;
                $("#trial").fadeOut(300, function() {
                    window.setTimeout(function() {
                        _stream.apply(t);
                    }, 700);
                });
            }
        }
    }


    var log_response_trial = function() {
        exp.data_trials.push({
            "color": this.stim.col1,
            "proportion": this.stim.p1,
            "description": this.resp1
        });
        exp.data_trials.push({
            "color": this.stim.col2,
            "proportion": this.stim.p2,
            "description": this.resp2
        });
    }




    slides.trial = slide({
        name: "trial",
        present: exp.trials,
        present_handle: present_handle_trial,
        button: button_trial,
        log_responses: log_response_trial
    });





    slides.subj_info = slide({
        name: "subj_info",
        submit: function(e) {
            //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
            exp.subj_data = {
                language: $("#language").val(),
                other_languages: $("#other-language").val(),
                asses: $('input[name="assess"]:checked').val(),
                comments: $("#comments").val(),
                problems: $("#problems").val(),
                fairprice: $("#fairprice").val()
            };
            exp.go(); //use exp.go() if and only if there is no "present" data.
        }
    });

    slides.thanks = slide({
        name: "thanks",
        start: function() {
            exp.data = {
                "trials": exp.data_trials,
                "system": exp.system,
                "condition": null,
                "misread_instructions": null,
                "subject_information": exp.subj_data,
                "time_in_minutes": (Date.now() - exp.startT) / 60000
            };
            setTimeout(function() {
                turk.submit(exp.data);
            }, 1000);
        }
    });

    slides.auth = slide({
        "name": "auth",
        start: function() {

            $(".err").hide();
            // define possible speaker and listener names
            // fun fact: 10 most popular names for boys and girls
            var speaker = _.shuffle(["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"])[0];
            var listener = _.shuffle(["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Margaret"])[0];

            var story = speaker + ' says to ' + listener + ': "It\'s a beautiful day, isn\'t it?"'

            $("#check-story").text(story);
            $("#check-question").text("Who is " + speaker + " talking to?");
            this.trials = 0;
            this.listener = listener;

        },
        button: function() {
            this.trials++;
            $(".err").hide();
            resp = $("#check-input").val();
            if (resp.toLowerCase() == this.listener.toLowerCase()) {
                exp.go();
            } else {
                if (this.trials < 2) {
                    $("#check-error").show();
                } else {
                    $("#check-error-final").show();
                    $("#check-button").attr("disabled", "disabled");
                }
            }
        }
    });

    return slides;
}

/// init ///
function init() {
    exp.post_exposure = true;
    exp.condition = CONDITION;
    exp.trials = _.shuffle(build_trials());
    exp.catch_trials = [];
    exp.system = {
        Browser: BrowserDetect.browser,
        OS: BrowserDetect.OS,
        screenH: screen.height,
        screenUH: exp.height,
        screenW: screen.width,
        screenUW: exp.width
    };
    //blocks of the experiment:
    exp.structure = ["i0", "auth", "instructions", "trial", 'subj_info', 'thanks'];

    exp.data_trials = [];
    //make corresponding slides:
    exp.slides = make_slides(exp);

    exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
    //relies on structure and slides being defined

    $('.slide').hide(); //hide everything

    //make sure turkers have accepted HIT (or you're not in mturk)
    $("#start_button").click(function() {
        if (turk.previewMode) {
            $("#mustaccept").show();
        } else {
            $("#start_button").click(function() {
                $("#mustaccept").show();
            });
            exp.go();
        }
    });




    exp.go(); //show first slide

    imgs = [];

    for (var i = 0; i < percentages.length; i++) {
        imgs.push("./stimuli/gumball_blue_" + percentages[i] + ".png")
        imgs.push("./stimuli/gumball_orange_" + percentages[i] + ".png")

    }


    preload(imgs);

    $("input.input-blank").keydown(function(evt) {
        if (evt.keyCode == 13) {
            _s.button();
        }
    });

}
