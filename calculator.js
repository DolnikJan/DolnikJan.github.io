nodeCount = 0;
class component {
    constructor(name, circuit) {
        this.name = name;
        this.circuit = circuit;
        circuit.components.push(this);
    }
    left_node = null;
    right_node = null;
    last_updated = null;
    voltage = 0;
    current = 0;
    resistance = 0;
    number = -1;

    setVoltage(voltage) {
        this.voltage = voltage;
        this.last_updated = Date.now();
    }
    setCurrent(current) {
        this.current = current;
        this.last_updated = Date.now();
    }
    setResistance(resistance) {
        this.resistance = resistance;
        this.last_updated = Date.now();
    }

    getVoltage() {
        return this.voltage;
    }
    getCurrent() {
        return this.current;
    }
    getResistance() {
        return this.resistance;
    }
    getName() {
        return this.name;
    }

    getLastUpdated() {
        return this.last_updated;
    }

    connectWithComponent(component, side1, side2) {
        // side1 and side2: "left" or "right"
        if ((side1 !== "left" && side1 !== "right") || (side2 !== "left" && side2 !== "right")) {
            throw new Error('side1 and side2 must be "left" or "right"');
        }
        let node1 = null;
        let node2 = null;
        if (side1 === "left") {
            if (this.left_node) {
                node1 = this.left_node;
            } else {
                node1 = createNewNode(this.circuit);
                this.left_node = node1;
                node1.addComponent(this);

            }

        } else {
            if (this.right_node) {
                node1 = this.right_node;
            } else {
                node1 = createNewNode(this.circuit);
                this.right_node = node1;
                node1.addComponent(this);
            }
        }
        if (side2 === "left") {
            if (component.left_node) {
                node2 = component.left_node;

            } else {
                node2 = createNewNode(this.circuit);
                component.left_node = node2;
                node2.addComponent(component);
            }
        } else {
            if (component.right_node) {
                node2 = component.right_node;
            } else {
                node2 = createNewNode(this.circuit);
                component.right_node = node2;
                node2.addComponent(component);
            }
        }
        // If both components already have knots, link the knots together by adding all components from one knot to the other
        for (let comp of node2.components) {
            node1.addComponent(comp);
            if (comp.left_node === node2) {
                comp.left_node = node1;
            } else if (comp.right_node === node2) {
                comp.right_node = node1;
            }
        }
        // Remove node2 from the circuit's node list
        const index = component.left_node ? component.left_node.circuit.nodes.indexOf(node2) : component.right_node.circuit.nodes.indexOf(node2);
        if (index > -1) {
            component.left_node ? component.left_node.circuit.nodes.splice(index, 1) : component.right_node.circuit.nodes.splice(index, 1);
        }
        //console.log("Merged nodes: " + node1.number + " and " + node2.number);
        //console.log(nodeCount);
        /*}else if (!node1 && !node2) {
            // Create a new knot if neither component has one and link both components to it
            const newNode = createNewNode(this.circuit);
            newNode.addComponent(this);
            newNode.addComponent(component);
            if(side1==="left"){
                this.left_node = newNode;
            } else {
                this.right_node = newNode;
            }   
            if(side2==="left"){
                component.left_node = newNode;
            } else {
                component.right_node = newNode;
            }
            return;
        } else {
            // If only one component has a knot, add the other component to that knot
            const existingNode = node1 || node2;
            existingNode.addComponent(this);
            existingNode.addComponent(component);
            if(!node1){
                if(side1==="left"){ 
                    this.left_node = existingNode;
                }
                else {
                    this.right_node = existingNode;
                }   
            } else {
                if(side2==="left"){
                    component.left_node = existingNode;
                } else {
                    component.right_node = existingNode;
                }
            }
                
            return;
            */


    }

    /* addNeighbor(neighbor, side = "right") {
         // side: "left" or "right"
         if (side !== "left" && side !== "right") throw new Error('side must be "left" or "right"');
         const nodeProp = side === "left" ? "left_node" : "right_node";
         const neighborProp = side === "left" ? "right_node" : "left_node";
 
         if (!this[nodeProp]) {
             // Create a new knot if it doesn't exist and link both components to it
             this[nodeProp] = new node();
             this[nodeProp].addComponent(this);
             neighbor[neighborProp] = this[nodeProp];
             this[nodeProp].addComponent(neighbor);
             return;
         } else {
             // If a knot already exists, just add the neighbor to it
             this[nodeProp].addComponent(neighbor);
             neighbor[neighborProp] = this[nodeProp];
             return;
         }
     }
         */

    removeLeftNeighbor(neighbor) {
        //Remove the links between this component and the neighbor and remove knots if no links remain
        this.left_links--;
        neighbor.right_links--;
        if (this.left_links === 0) {
            this.left_node.removeComponent(this);
            this.left_node = null;
        }
        if (neighbor.right_links === 0) {
            neighbor.right_node.removeComponent(neighbor);
            neighbor.right_node = null;
        }
    }

    removeRightNeighbor(neighbor) {
        //Remove the links between this component and the neighbor and remove knots if no links remain
        this.right_links--;
        neighbor.left_links--;
        if (this.right_links === 0) {
            this.right_node.removeComponent(this);
            this.right_node = null;
        }
        if (neighbor.left_links === 0) {
            neighbor.left_node.removeComponent(neighbor);
            neighbor.left_node = null;
        }
    }
}
//let voltageSources = [];

class voltageSource extends component {
    constructor(voltage, circuit) {
        super("Voltage Source", circuit);
        this.voltage = voltage;
        circuit.voltageSources.push(this);
    }

    getPower() {
        return this.voltage * this.current;
    }
}
class rezistor extends component {
    constructor(type, resistance, circuit) {
        super("Rezistor", circuit);
        this.type = type;
        this.resistance = resistance;
    }

}

class light_bulb extends component {
    constructor(current, voltage, resistance, circuit) {
        super("Light Bulb", circuit);
        this.current = current;
        this.voltage = voltage;
        this.resistance = resistance;
    }

}

class node {
    number = 0;
    circuit = null;
    constructor(number, circuit) {
        this.number = number;
        this.circuit = circuit;
        //circuit.nodes.push(this);
    }
    components = [];
    addComponent(component) {
        this.components.push(component);
    }
    removeComponent(component) {
        this.components = this.components.filter(c => c !== component);
    }


}

function createNewNode(circuit) {
    const newNode = new node(nodeCount++, circuit);
    circuit.nodes.push(newNode);
    //console.log("Created new node with number: " + newNode.number);
    //console.log(Date.now());
    return newNode;
}


class circuit {
    components = [];
    nodes = [];
    voltageSources = [];
}
function createMatrix(x, y) {
    let matrix = [];
    for (let i = 0; i < x; i++) {
        matrix[i] = [];
        for (let j = 0; j < y; j++) {
            matrix[i][j] = 0;
        }
    }
    return matrix;
}

function setupCircuit(circuit) {
    console.log("Setting up circuit...");
    circuit.voltageSources.forEach(element => { element.number = circuit.voltageSources.indexOf(element); });
    circuit.nodes.forEach(element => { element.number = circuit.nodes.indexOf(element) - 1; });
    circuit.nodes.shift(); // Remove ground node
    //circuit.nodes.forEach(element => {console.log(element);});
    //circuit.components.forEach(element => {element.number = circuit.components.indexOf(element);});
    console.log("Circuit setup complete.");
}
function prepareMatrixG(circuit) {
    // Remove ground node (node 0) from the circuit nodes for matrix calculations
    // circuit.nodes.shift();
    nodeCount = 0;

    // Assign new numbers to nodes after removing ground
    /*for (let node of circuit.nodes) {
        node.number = nodeCount++;
    }*/

    let matrixG = createMatrix(circuit.nodes.length, circuit.nodes.length);
    matrixG.forEach(element => {
        console.log(element);
    });

    // Fill in the conductance values
    for (let node of circuit.nodes) {
        //console.log("Processing node number: " + node.number);
        for (let component of node.components) {
            if (component.getResistance() === 0) continue;
            //console.log("  Adding conductance for component: " + component.getName() + " with resistance: " + 1 / component.getResistance());
            matrixG[node.number][node.number] += 1 / component.getResistance();
        }
    }
    for (let component of circuit.components) {
        if (component.left_node && component.right_node) {
            if (component.getResistance() === 0 || component.left_node.number === -1 || component.right_node.number === -1) continue;
            //console.log("  Subtracting conductance for component between nodes: " + component.left_node.number + " and " + component.right_node.number + " with resistance: " + 1 / component.getResistance());
            matrixG[component.left_node.number][component.right_node.number] -= 1 / component.getResistance();
            matrixG[component.right_node.number][component.left_node.number] -= 1 / component.getResistance();
        }
    }


    //matrixG.forEach(element => { console.log(element);});
    return matrixG;
}
function prepareMatrixB(circuit) {
    //onsole.log("Preparing Matrix B for circuit with " + circuit.nodes.length + " nodes and " + circuit.voltageSources.length + " voltage sources.");
    let rows = circuit.nodes.length;
    let cols = circuit.voltageSources.length;
    let matrixB = createMatrix(rows, cols);
    //let matrixC = createMatrix(circuit.voltageSources.length, nodeCount);
    //circuit.voltageSources.forEach(element => { console.log(element); });
    // console.log("Preparing Matrix B");
    //matrixB.forEach(element => { console.log(element); });
    //console.log("Preparing Matrix C");
    //matrixC.forEach(element => { console.log(element); });
    //circuit.voltageSources.forEach(element => { console.log(element); });
    for (let source of circuit.voltageSources) {
        let index = circuit.voltageSources.indexOf(source);
        //console.log("Voltage source index: " + index);
        //console.log(source);
        //console.log("Processing voltage source at index: " + index);
        //console.log(source.left_node);
        //console.log(source.right_node);
        if (source.left_node && source.left_node.number !== -1 && source.left_node.number < rows) {
            //console.log("Processing left node of voltage source at index: " + index + " " + source.left_node.number);
            matrixB[source.left_node.number][index] = 1;
            /// matrixC[index][source.left_node.number] = 1;
            //matrixB.forEach(element => { console.log(element); });
            // console.log("----");
        }


        if (source.right_node && source.right_node.number !== -1 && source.right_node.number < rows) {
            // console.log("Processing right node of voltage source at index: " + index + " " + source.right_node.number);
            matrixB[source.right_node.number][index] = -1;
            //matrixC[index][source.right_node.number] = -1;
            //matrixB.forEach(element => { console.log(element); });
            //console.log("----");
        }

    }
    //console.log("Final Matrix B:");
    //matrixB.forEach(element => { console.log(element); });
    return matrixB;
}
function transposeMatrix(matrix) {
    let transposed = createMatrix(matrix[0].length, matrix.length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }
    return transposed;
}
function prepareMatrixA(circuit) {
    setupCircuit(circuit);
    let matrixG = prepareMatrixG(circuit);
    let matrixB = prepareMatrixB(circuit);
    let matrixC = transposeMatrix(matrixB);

    /* console.log("Matrix G:");
     matrixG.forEach(row => console.log(row));
     console.log("-----");
     console.log("Matrix B:");
     matrixB.forEach(row => console.log(row));
     console.log("-----");
     console.log("Matrix C:");
     matrixC.forEach(row => console.log(row));
     console.log("-----");*/
    let rows = matrixG.length + matrixB[0].length;
    let cols = matrixG[0].length + matrixB.length;
    let matrixA = createMatrix(rows, cols - 1);
    for (let i = 0; i < matrixG.length; i++) {
        for (let j = 0; j < matrixG[0].length; j++) {
            matrixA[i][j] = matrixG[i][j];
        }
    }
    for (let i = 0; i < matrixB.length; i++) {
        for (let j = 0; j < matrixB[0].length; j++) {
            matrixA[i][j + matrixG[0].length] = matrixB[i][j];
        }
    }

    for (let i = 0; i < matrixC.length; i++) {
        for (let j = 0; j < matrixC[0].length; j++) {
            matrixA[i + matrixG.length][j] = matrixC[i][j];
        }
    }
    return matrixA;
}
function prepareMatrixX(circuit) {
    matrixX = createMatrix(circuit.nodes.length + circuit.voltageSources.length, 1);

}

function prepareMatrixZ(circuit) {
    console.log("Preparing Matrix Z for circuit with " + circuit.nodes.length + " nodes and " + circuit.voltageSources.length + " voltage sources.");
    let matrixZ = createMatrix(circuit.nodes.length + circuit.voltageSources.length, 1);
    for (let i = circuit.nodes.length; i < circuit.voltageSources.length + circuit.nodes.length; i++) {
        matrixZ[i][0] = circuit.voltageSources[i - circuit.nodes.length].getVoltage();
        console.log("Voltage Source " + (i - circuit.nodes.length) + " Voltage: " + matrixZ[i][0]);
    }
    console.log("Final Matrix Z:");
    matrixZ.forEach(element => { console.log(element); });
    console.log("-----");
    return matrixZ;
}
function multyplyMatrixByMatrix(matrix1, matrix2) {
    let result = createMatrix(matrix1.length, matrix2[0].length);
    for (let i = 0; i < matrix1.length; i++) {
        for (let j = 0; j < matrix2[0].length; j++) {
            for (let k = 0; k < matrix1[0].length; k++) {
                result[i][j] += matrix1[i][k] * matrix2[k][j];
            }
        }
    }
    return result;
}

//copilot "create a function which will invert a matrix"
function matrix_invert(M) {
    const n = M.length;
    if (n === 0 || M[0].length !== n) throw new Error("matrix must be square");

    // Create copies: C = M, I = identity
    const C = createMatrix(n, n);
    const I = createMatrix(n, n);
    for (let i = 0; i < n; i++) {
        I[i][i] = 1;
        for (let j = 0; j < n; j++) {
            C[i][j] = M[i][j];
        }
    }

    for (let i = 0; i < n; i++) {
        // Partial pivoting: find row with largest pivot in column i
        let maxRow = i;
        let maxVal = Math.abs(C[i][i]);
        for (let r = i + 1; r < n; r++) {
            const val = Math.abs(C[r][i]);
            if (val > maxVal) {
                maxVal = val;
                maxRow = r;
            }
        }
        if (maxVal === 0) throw new Error("Matrix is singular and cannot be inverted");

        // Swap rows i and maxRow in both C and I
        if (maxRow !== i) {
            [C[i], C[maxRow]] = [C[maxRow], C[i]];
            [I[i], I[maxRow]] = [I[maxRow], I[i]];
        }

        // Normalize pivot row
        const pivot = C[i][i];
        for (let j = 0; j < n; j++) {
            C[i][j] /= pivot;
            I[i][j] /= pivot;
        }

        // Eliminate other rows
        for (let r = 0; r < n; r++) {
            if (r === i) continue;
            const factor = C[r][i];
            if (factor === 0) continue;
            for (let j = 0; j < n; j++) {
                C[r][j] -= factor * C[i][j];
                I[r][j] -= factor * I[i][j];
            }
        }
    }

    return I;
}
function calculateCircuit(circuit) {
    //setupCircuit(circuit);
    let matrixA = prepareMatrixA(circuit);
    let matrixZ = prepareMatrixZ(circuit);
    const Ainv = matrix_invert(matrixA);
    let matrixI = multyplyMatrixByMatrix(Ainv, matrixZ);
    circuit.components.forEach(component => {
        //console.log("Calculating values for component: " + component.getName());
        if(component instanceof voltageSource) {
            component.setCurrent(matrixI[circuit.nodes.length + component.number][0]);
            //console.log("Voltage Source Current set to: " + component.getCurrent() + " A");
        } else {
            //console.log("Calculating current for component number: " + component.number);
            // Calculate voltage across the component
            let voltage = 0;
            if (component.left_node && component.left_node.number !== -1) {
                voltage += matrixI[component.left_node.number][0];
            }
            if (component.right_node && component.right_node.number !== -1) {
                voltage -= matrixI[component.right_node.number][0];
            }
            component.setVoltage(voltage);
            component.setCurrent(voltage / component.getResistance());
        }
        console.log("Component: " + component.getName() + ", Voltage: " + component.getVoltage() + " Volts, Current: " + component.getCurrent() + " Amps, Resistance: " + component.getResistance() + " Ohms");
    });

    return matrixI;
}

/*let myCircuit = new circuit();
let source = new voltageSource(24, myCircuit);
let rezistor1 = new rezistor("carbon", 2, myCircuit);
let rezistor2 = new rezistor("carbon", 6, myCircuit);
let light_bulb1 = new light_bulb(0, 0, 3, myCircuit);
let light_bulb2 = new light_bulb(0, 0, 1, myCircuit);
myCircuit.nodes.forEach(element => { console.log(element); });
myCircuit.components.forEach(element => { console.log(element); });


source.connectWithComponent(rezistor1, "right", "left");
rezistor1.connectWithComponent(light_bulb1, "right", "left");
light_bulb1.connectWithComponent(rezistor2, "right", "left");
rezistor2.connectWithComponent(light_bulb2, "right", "left");
light_bulb2.connectWithComponent(source, "right", "left");
matrixG = prepareMatrixG(myCircuit);
matrixB = prepareMatrixB(myCircuit);
console.log("Matrix B");
matrixB.forEach(element => {  console.log(element); });


console.log("--------------------------------------------------");
*/
nodeCount = 0;
let myCircuit2 = new circuit();

let V2 = new voltageSource(20, myCircuit2);
let V1 = new voltageSource(32, myCircuit2);
let R1 = new rezistor("carbon", 2, myCircuit2);
let R2 = new rezistor("carbon", 4, myCircuit2);
let R3 = new rezistor("carbon", 8, myCircuit2);



V2.connectWithComponent(R1, "right", "left");
V2.connectWithComponent(R3, "right", "left");
V2.connectWithComponent(R2, "left", "right");

R1.connectWithComponent(V1, "right", "right");

V1.connectWithComponent(R2, "left", "left");
V1.connectWithComponent(R3, "left", "right");/*
setupCircuit(myCircuit2);
myCircuit2.nodes.forEach(element => { console.log(element); });
myCircuit2.components.forEach(element => { console.log(element); });
myCircuit2.voltageSources.forEach(element => { console.log(element); });

console.log("Circuit 2 Components:");
matrixG2 = prepareMatrixG(myCircuit2);

matrixB2 = prepareMatrixB(myCircuit2);

matrixG2.forEach(element => {  console.log(element); });
matrixB2.forEach(element => {  console.log(element); });
*/
/*
setupCircuit(myCircuit2);
matrixB= prepareMatrixB(myCircuit2);
matrixC= transposeMatrix(matrixB);
console.log("---------------Transposedmatrixes------------------------------------");
matrixC.forEach(element => {  console.log(element); });
console.log("------------------");
matrixB.forEach(element => {  console.log(element); });
console.log("---------------------afhakfhalfhalkf-----------------------------");
*/
//setupCircuit(myCircuit2);

//setupCircuit(myCircuit2);
/*
let matrixA = prepareMatrixA(myCircuit2);
let matrixZ = prepareMatrixZ(myCircuit2);
const Ainv2 = matrix_invert(matrixA);
let matrixI = multyplyMatrixByMatrix(Ainv2, matrixZ);

matrixA = prepareMatrixA(myCircuit2);
console.log("MatrixA:");
matrixA.forEach(row => { console.log(row); });
console.log("---------------------endof Matrix A-----------------------------");

matrixZ = prepareMatrixZ(myCircuit2);
console.log("MatrixZ:");
matrixZ.forEach(row => { console.log(row); });
console.log("---------------------endof Matrix Z-----------------------------");

// Ensure A is square before inverting
if (!matrixA.length || matrixA.length !== matrixA[0].length) {
    throw new Error("Matrix A must be square for MNA (rows !== cols): " + matrixA.length + "x" + (matrixA[0] ? matrixA[0].length : 0));
}

const Ainv = matrix_invert(matrixA);
console.log("Matrix Inverted A:");
Ainv.forEach(row => { console.log(row); });
console.log("---------------------endof Matrix Inverted A-----------------------------");

console.log("Matrix AxA-1:");
multyplyMatrixByMatrix(matrixA, Ainv).forEach(row => { console.log(row); });
console.log("---------------------endof Matrix AxA-1-----------------------------");

console.log("Matrix I:");
matrixI = multyplyMatrixByMatrix(Ainv, matrixZ);
matrixI.forEach(row => { console.log(row); });
console.log("---------------------endof Matrix I-----------------------------");

console.log("Matrix AxI:");
multyplyMatrixByMatrix(matrixA, matrixI).forEach(row => { console.log(row); });
console.log("---------------------endof Matrix AxI-----------------------------");

//multyplyMatrixByMatrix(matrixA, matrixI).forEach(element => {  console.log(element); });
*/
calculateCircuit(myCircuit2).forEach(row => { console.log(row); });
/*
//matrixG.forEach(element => {console.log(element);});

console.log("Power Supply Power: " + source.getCurrent() + " Amps" + ", Voltage: " + source.getVoltage() + " Volts" + ", Resistance: " + source.getResistance() + " Ohms");
console.log("Rezistor Resistance: " + rezistor1.getCurrent() + " Amps" + ", Voltage: " + rezistor1.getVoltage() + " Volts" + ", Resistance: " + rezistor1.getResistance() + " Ohms");
console.log("Light Bulb Current: " + light_bulb1.getCurrent() + " Amps" + ", Voltage: " + light_bulb1.getVoltage() + " Volts" + ", Resistance: " + light_bulb1.getResistance() + " Ohms");
console.log("Rezistor2 Resistance: " + rezistor2.getCurrent() + " Amps" + ", Voltage: " + rezistor2.getVoltage() + " Volts" + ", Resistance: " + rezistor2.getResistance() + " Ohms");
console.log("Light Bulb2 Current: " + light_bulb2.getCurrent() + " Amps" + ", Voltage: " + light_bulb2.getVoltage() + " Volts" + ", Resistance: " + light_bulb2.getResistance() + " Ohms");

//calculateSeriesCircuit(source);

console.log("Power Supply Power: " + source.getCurrent() + " Amps" + ", Voltage: " + source.getVoltage() + " Volts" + ", Resistance: " + source.getResistance() + " Ohms");
console.log("Rezistor Resistance: " + rezistor1.getCurrent() + " Amps" + ", Voltage: " + rezistor1.getVoltage() + " Volts" + ", Resistance: " + rezistor1.getResistance() + " Ohms");
console.log("Light Bulb Current: " + light_bulb1.getCurrent() + " Amps" + ", Voltage: " + light_bulb1.getVoltage() + " Volts" + ", Resistance: " + light_bulb1.getResistance() + " Ohms");
console.log("Rezistor2 Resistance: " + rezistor2.getCurrent() + " Amps" + ", Voltage: " + rezistor2.getVoltage() + " Volts" + ", Resistance: " + rezistor2.getResistance() + " Ohms");
console.log("Light Bulb2 Current: " + light_bulb2.getCurrent() + " Amps" + ", Voltage: " + light_bulb2.getVoltage() + " Volts" + ", Resistance: " + light_bulb2.getResistance() + " Ohms");
*/


