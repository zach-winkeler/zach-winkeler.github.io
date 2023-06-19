let layoutOptions = {
    name: 'concentric',
    concentric: function(node) {return -node.data().grading},
    animate: true,
    minNodeSpacing: 200,
    startAngle: -(Math.PI/2 + Math.PI/6),
    sweep: Math.PI/3
};

function calcColor(min, max, val)
{
    let minHue = 240, maxHue=0;
    let curPercent = (val - min) / (max-min);
    return "hsl(" + ((curPercent * (maxHue-minHue) ) + minHue) + ",100%,50%)";
}

function generateElements(differential, gradings) {
    let n = differential.size()[0];
    let nodes = [];
    for (let i = 0; i < n; i++) {
        nodes.push({ data: { id: `${i}`, grading: gradings[i]}});
    }
    let edges = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (differential.get([i, j]) === 1) {
                edges.push({ data: { id: `(${i},${j})`, source: `${j}`, target: `${i}`}});
            }
        }
    }
    return { nodes: nodes, edges: edges };
}

let cy = undefined;

function setup(differential, gradings) {
    let elements = generateElements(differential, gradings);

    cy = cytoscape({
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: true,

        style: cytoscape.stylesheet()
            .selector('node')
            .style({
                'content': 'data(id)',
                'background-color': function(ele) { return calcColor(math.min(gradings), math.max(gradings), ele.data('grading')); }
            })
            .selector('edge')
            .style({
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle',
                'width': 4,
                'line-color': '#ddd',
                'target-arrow-color': '#ddd'
            })
            .selector('.highlighted')
            .style({
                'background-color': '#61bffc',
                'line-color': '#61bffc',
                'target-arrow-color': '#61bffc',
                'transition-property': 'background-color, line-color, target-arrow-color',
                'transition-duration': '0.5s'
            }),

        elements: elements,

        layout: layoutOptions
    });

    cy.on('tap', 'edge', function(event) {
        reduceEdge(event.target, 1000);
    });
}

function reduceEdge(edge, delay) {
    animateReduceEdge(edge, delay);
    setTimeout(() => {dataReduceEdge(edge)}, delay);
}

function dataReduceEdge(edge) {
    let x = edge.source();
    let y = edge.target();
    let ws = y.incomers('node');
    let zs = x.outgoers('node');
    for (const w of ws) {
        if (w === x || w === y) {
            continue;
        }
        for (const z of zs) {
            if (z === x || z === y) {
                continue;
            }
            let wzs = w.edgesTo(z);
            if (wzs.size() === 0) {
                cy.add([{ group: 'edges', data: { id: w.id() + z.id(), source: w.id(), target: z.id() } }])
            } else {
                cy.remove(wzs);
            }
        }
    }
    cy.remove(x);
    cy.remove(y);
}

function animateReduceEdge(edge, delay) {
    edge.animate({
        style: {'line-color':'black'}
    });
    edge.connectedNodes().animate({
        position: edge.midpoint(),
        duration: delay
    });
}

function deltaF(edge) {
    return math.abs(edge.target().data('grading') - edge.source().data('grading'));
}

function runAlgorithm(delay) {
    if (cy.edges().size() > 0) {
        let eMin = cy.edges()[0];
        for (const e of cy.edges()) {
            if (deltaF(e) < deltaF(eMin)) {
                eMin = e;
            }
        }
        reduceEdge(eMin, delay);
        setTimeout(() => {runAlgorithm(delay)}, delay);
    }
}

// S^1 /\ S^2 /\ S^1
// setup(math.matrix(
//     [
//         [0,0,0,0,1,1,0,0,0,0,0,0],
//         [0,0,0,0,1,1,1,1,0,0,0,0],
//         [0,0,0,0,0,0,1,1,1,1,0,0],
//         [0,0,0,0,0,0,0,0,1,1,0,0],
//         [0,0,0,0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0,0,1,1],
//         [0,0,0,0,0,0,0,0,0,0,1,1],
//         [0,0,0,0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0,0,0,0],
//         [0,0,0,0,0,0,0,0,0,0,0,0]
//     ]
// ), [0,0,1,2,0,0,1,1,2,2,1,1]);

// counter-example
// setup(math.matrix(
//     [
//         [0,0,0,0,0],
//         [1,0,0,0,0],
//         [0,0,0,0,0],
//         [1,0,0,0,0],
//         [0,1,1,1,0]
//     ]
// ), [0,1,2,2,2]);

setup(math.matrix(
    [
        [0,0,0,0,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0]
    ]
), [0,0,1,2,0,0,1,1,2,2,1,1]);