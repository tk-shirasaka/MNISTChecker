function App () {
    var self = this;
    var stage = new createjs.Stage('stage');
    var weight = document.getElementById('strokeweight');
    var background = new createjs.Shape();
    var shape = new createjs.Shape();
    var history = [];

    self.reset = function() {
        shape.graphics.clear();
        history = [];
    };

    self.start = function(e) {
        shape.graphics
            .beginStroke('Black')
            .setStrokeStyle(weight.value, 'round')
            .moveTo(e.stageX, e.stageY);
        stage.addEventListener('stagemousemove', self.move);
        stage.addEventListener('stagemouseup', self.end);
        history.push({f: 'beginStroke', args: ['Black']}, {f: 'moveTo', x: e.stageX, y: e.stageY});
    };

    self.move = function(e) {
        shape.graphics
            .lineTo(e.stageX, e.stageY)
            .endStroke()
            .beginStroke('Black')
            .setStrokeStyle(weight.value, 'round')
            .moveTo(e.stageX, e.stageY);
        history.push({f: 'lineTo', args: [e.stageX, e.stageY]}, {f: 'endStroke'}, {f: 'beginStroke', args: ['Black']}, {f: 'moveTo', args: [e.stageX, e.stageY]});
    };

    self.end = function(e) {
        shape.graphics
            .lineTo(e.stageX, e.stageY)
            .endStroke();
        stage.removeAllEventListeners('stagemousemove');
        stage.removeAllEventListeners('stagemouseup');
        history.push({f: 'lineTo', args: [e.stageX, e.stageY]}, {f: 'endStroke'});
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

    weight.addEventListener('change', function() {
        shape.graphics
            .clear()
            .setStrokeStyle(weight.value, 'round');
        history.forEach(function(op) {
            shape.graphics[op.f](...(op.args === undefined ? [] : op.args));
        });
        if (history.length) self.upload();
    });

    stage.addEventListener('stagemousedown', self.start);
    createjs.Ticker.addEventListener('tick', stage);

    background.graphics
        .beginStroke('White')
        .beginFill('White')
        .rect(0, 0, 400, 400)
    stage.addChild(background, shape);
};

app = new App();
