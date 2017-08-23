function App () {
    var stage = new createjs.Stage('stage');
    var self = this;
    var background, shape;

    self.reset = function() {
        shape = new createjs.Shape();
        background = new createjs.Shape();
        background.graphics
            .beginStroke('White')
            .beginFill('White')
            .rect(0, 0, 400, 400)
        stage.removeAllChildren();
        stage.addChild(background, shape);
    };

    self.start = function(e) {
        shape.graphics
            .beginStroke('Black')
            .setStrokeStyle(10, 'round')
            .moveTo(e.stageX, e.stageY);
        stage.addEventListener('stagemousemove', self.move);
        stage.addEventListener('stagemouseup', self.end);
    };

    self.move = function(e) {
        shape.graphics
            .lineTo(e.stageX, e.stageY)
            .endStroke()
            .beginStroke('Black')
            .setStrokeStyle(10, 'round')
            .moveTo(e.stageX, e.stageY);
    };

    self.end = function(e) {
        shape.graphics
            .lineTo(e.stageX, e.stageY)
            .endStroke();
         stage.removeAllEventListeners('stagemousemove');
         stage.removeAllEventListeners('stagemouseup');
    };

    self.upload = function() {
        var options = {
            method  : 'POST',
            headers : {'Content-Type': 'application/json'},
            body    : JSON.stringify({image: stage.canvas.toDataURL('png')}),
        };
        fetch('/check', options)
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                var chart = document.getElementById('chart').getContext('2d');
                var elements = document.getElementsByClassName('score');
                var max = Math.max(...json);

                for (var i = 0; i < 10; i++) {
                    elements[i].innerHTML = json[i] + '%';
                    elements[i].nextElementSibling.children[0].innerHTML = (json[i] == max) ? 'check_circle' : '';
                }
                new Chart(chart, {
                    type: 'doughnut',
                    data: {
                        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                        datasets: [{
                            data: json,
                            backgroundColor: ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'indigo', 'pink', 'cyan', 'teal'],
                        }],
                    }
                });
            });
    };

    stage.addEventListener('stagemousedown', self.start);
    createjs.Ticker.addEventListener('tick', stage);
    self.reset();
};

app = new App();
