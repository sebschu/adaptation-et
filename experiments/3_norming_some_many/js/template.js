var N_REPETITIONS = 2;


var SENTENCES = _.shuffle([
    ["some", "... some of the gumballs."],
    ["many", "... many of the gumballs."],
    ["all", "... all of the gumballs."],
]);

var cols = _.shuffle(COLORS);

var trial_counter = 0;


function build_trials() {
    var trials = [];
    for (var j = 0; j < N_REPETITIONS; j++) {  
        for (var i = 0; i < percentages.length; i++) {
            trials.push({
                "sentences": SENTENCES,
                "proportion": percentages[i],
                "image": "./stimuli/gumball_blue_" + percentages[i] + ".png"
            });
        }
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
            
            window.setTimeout(function() {
                $("#instructions-gumball-machine").attr("src", "./stimuli/gumball_blue_40.png");
                $("#instructions-button").attr("disabled", null);
            }, 1500);
        },
        button: function() {
            if (this.step == 1) {
                $("#instructions-part1").fadeOut(500, function() {
                    $("#instructions-part2").fadeIn(1000);
                });
                this.step = 2;
            } else {
                exp.go();   
            }
        }
    });

    slides.trial = slide({
      name: "trial",
      present: exp.trials,
      present_handle: function(stim) {
        $(".err").hide();
        this.stim = stim;
        //$(".display_condition").html(stim.prompt);
      
            $("#gumball-machine").attr("src", "./stimuli/gumball_blue_0.png");
  			$("#sent_1").text(stim["sentences"][0][1]);
  			$("#sent_2").text(stim["sentences"][1][1]);
  			$("#sent_3").text(stim["sentences"][2][1]);
			
			
  			var callback = function () {
				
  				var total = $("#slider_1").slider("option", "value") + $("#slider_2").slider("option", "value") + $("#slider_3").slider("option", "value") + $("#slider_4").slider("option", "value");
				
				
  				if (total > 1.0) {
  					var other_total = total - $(this).slider("option", "value");
  					$(this).slider("option", "value", 1 - other_total);
  				}
				
  				var perc = Math.round($(this).slider("option", "value") * 100);
  				$("#" + $(this).attr("id") + "_val").val(perc);
				
  			}
  			utils.make_slider("#slider_1", callback);			
  			utils.make_slider("#slider_2", callback);
  			utils.make_slider("#slider_3", callback);
  			utils.make_slider("#slider_4", callback);
			
            var _img = stim.image;
            
  			$("#trial").fadeIn(700, function() {
  			    window.setTimeout(function() {
  			      $("#gumball-machine").attr("src", _img);  
  			    }, 300); 
  			});
			
      },
      button : function(response) {
        this.response = response;
			
        var total = $("#slider_1").slider("option", "value") + $("#slider_2").slider("option", "value") + $("#slider_3").slider("option", "value") + $("#slider_4").slider("option", "value");
			
  			if (total < .99) {
  	      $(".err").show();
  			} else {
        	this.log_responses();
  				var t = this;
  				$("#trial").fadeOut(300, function() {
  					window.setTimeout(function() {
  						_stream.apply(t);
  					}, 700);
  				});
  		}
      
      },

      log_responses : function() {
          trial_counter++;
          
          for (var i = 0; i < 3; i++) {
            exp.data_trials.push({
                "trial" : trial_counter,
                "sentence": this.stim.sentences[i][1],
                "quantifier": this.stim.sentences[i][0],
                "rating": $("#slider_" + (i+1)).slider("option", "value"),
                "proportion": this.stim.proportion,
            });
          }
          exp.data_trials.push({
              "trial" : trial_counter,
              "sentence": "",
              "quantifier": "other",
              "rating": $("#slider_4").slider("option", "value"),
              "proportion": this.stim.proportion,
          });
        }
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
    exp.condition = "";
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

}
