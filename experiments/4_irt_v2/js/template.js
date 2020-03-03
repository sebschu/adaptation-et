var bonus = 0;

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
                  exp.go();
            }
        }
    });

    var init_trial = function(stim) {
        this.stim = stim;
        
        $(".bonus").show();
        $("#bonus-amount").text(bonus);
        
        
        //set up trial
        $(".gumball-canvas").removeClass("active");
        $("#gumball-button").click(function() {
          _s.init_irt();
          return false;
        });
        for (var i = 0; i < stim.trial_info.init_images.length; i++) {
          $("#gumball-machine-" + (i+1)).attr("src", "./stimuli/" + stim.trial_info.init_images[i]);
          $("#gumball-machine-" + (i+1)).unbind("click");
        }
        
        $("#trial-utterance span").text(" ");
        $("#trial-utterance").addClass("white");
        $("#trial-instruction").text("Click on the red button to dispense the gumballs");
        
        $("#trial").fadeIn(700, function() {});
    }

    // build partial utterance
    var build_utterance = function(utterance_parts, i) {
      var parts = utterance_parts.slice(0,i+1);
      
      if (!(parts[0] instanceof Array)) {
        var n = 1;
        parts = parts.map(function(x) { return[x, n++] });
      }
      var utt = parts.reduce(function(a,b) { return a + " " + b[0]}, "");
      var label = parts[i][1];
      
      return [utt, label];
      
    }

    // beginning of IRT trial
    var init_irt = function() {
      this.step = 0;
      $(".bonus").hide();
      var stim = this.stim;
      $(".gumball-canvas").addClass("active");
      $("#gumball-button").unbind("click").click(function() {return false;});
      for (var i = 0; i < this.stim.items.length; i++) {
        $("#gumball-machine-" + (i+1)).attr("src", "./stimuli/" + this.stim.items[i].image);
        $("#gumball-machine-" + (i+1)).data("label", stim.items[i].label);
        
        $("#gumball-machine-" + (i+1)).click(function() {
          _s.button($(this).data("label"));
          return false;
        });
      }
      $("#trial-instruction").text("Click on the gumball machine that best matches the description!");
      this.utterance_label = build_utterance(this.stim.utterance_parts, this.step);
      $("#trial-utterance span").text(this.utterance_label[0]);
      $("#trial-utterance").removeClass("white");
    }

    var button_trial = function(response) {
      this.response = response;
      this.step++;
      this.log_responses();
      
      if (this.step == this.stim.utterance_parts.length) {
        var t = this;
        $("#trial").fadeOut(300, function() {
          window.setTimeout(function() {
            _stream.apply(t);
          }, 700);
        });
        return;
      }
      
      this.utterance_label = build_utterance(this.stim.utterance_parts, this.step);
      $("#trial-utterance span").text(this.utterance_label[0]);
      
      if (this.step == this.stim.utterance_parts.length - 1) {
        $("#trial-utterance").addClass("white");
      }
      
    }

    var log_response_trial = function() {
      
      if (this.response == "target") {
        bonus += 0.5;
        if (this.step == this.stim.utterance_parts.length - 1) {
          bonus += 0.5;
        }
        if (this.step == this.stim.utterance_parts.length) {
          bonus += 1.5;
        }
      }
      
      for (var i = 0; i < this.stim.items.length; i++) {
        var item = this.stim.items[i];
        var resp = {
          "color": item.color,
          "percentage": item.percentage,
          "label": item.label,
          "clicked": item.label == this.response ? 1 : 0,
          "utterance": this.utterance_label[0],
          "utterance_label": this.utterance_label[1],
          "position": (i + 1)
        };
        for (var k in this.stim.trial_info) {
          resp[k] = this.stim.trial_info[k];
        }
        exp.data_trials.push(resp);
      }
    }


    slides.trial = slide({
        name: "trial",
        present: exp.trials,
        present_handle: init_trial,
        init_irt: init_irt,
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
            
            if (bonus < 175) {
              $("#bonus-msg").hide();
            } else {
              $("#final-bonus").text(Math.round(bonus)/100);
            }            
          
            exp.data = {
                "trials": exp.data_trials,
                "system": exp.system,
                "condition": CONDITION,
                "subject_information": exp.subj_data,
                "time_in_minutes": (Date.now() - exp.startT) / 60000,
                "bonus": bonus
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
    exp.condition = CONDITION;
    exp.trials = stims;
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

    //for (var i = 0; i < percentages.length; i++) {
    //    imgs.push("./stimuli/gumball_blue_" + percentages[i] + ".png")
    //    imgs.push("./stimuli/gumball_orange_" + percentages[i] + ".png")
    //
    //}


    preload(imgs);

    $("input.input-blank").keydown(function(evt) {
        if (evt.keyCode == 13) {
            _s.button();
        }
    });

}
