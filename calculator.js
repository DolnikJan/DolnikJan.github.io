
class Component {
    constructor(name) {
        this.name = name;
    }
    minusNode  = null;
    plusNode  = null;
    last_updated = null;
    voltage = 0;
    current = 0;
    resistance = 0;
     number = -1;

     replaceNode(oldNode, newNode) {
        if (this.minusNode  === oldNode) {
            this.minusNode  = newNode;
        } else if (this.plusNode  === oldNode) {
            this.plusNode  = newNode;
        }
    }
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

    
    
}

class VoltageSource extends Component {
    constructor(voltage) {
        super("Voltage Source");
        this.voltage = voltage;
    }

    getPower() {
        return this.voltage * this.current;
    }
}
class Resistor extends Component {
    constructor(resistance) {
        super("Resistor");
        this.resistance = resistance;
    }

}

class LightBulb extends Component {
    constructor(resistance) {
        super("Light Bulb");
        this.resistance = resistance;
    }

}

class Node {
    number = 0;
    circuit = null;
    components = [];
    addComponent(component) {
        if(!this.components.includes(component)) {
        this.components.push(component);
        }
    }
    removeComponent(component) {
        this.components.splice(this.components.indexOf(component), 1);
    }
    setCircuit(circuit) {
        this.circuit = circuit;
    }
    getComponents() {
        return this.components;
    }
    getCircuit() {
        return this.circuit;
    }


}

class Circuit {
    components = [];
    nodes = [];
    voltageSources = [];

    createComponent(name, value) {
        let component;
        switch(name) {
            case "Resistor":
                component= new Resistor(value, this);
                break;
            case "Voltage Source":
                component= new VoltageSource(value, this);
                this.voltageSources.push(component);
                break;
            case "Light Bulb":
                component= new LightBulb(value, this);
                break;
            default:
                throw new Error("Unknown component type: " + name);

        }
        this.components.push(component);

        
        component.minusNode = this.createNewNode();
        component.minusNode.addComponent(component);
        component.plusNode = this.createNewNode();
        component.plusNode.addComponent(component);
        return component;
    
    }
    createNewNode(){
        let node = new Node();
        this.nodes.push(node);
        node.setCircuit(this);
        return node;
    }
    
    mergeNodes(oldNode, newNode){
        if(oldNode === newNode) return;
        for (let component of oldNode.components) {
            component.replaceNode(oldNode, newNode);
            newNode.addComponent(component);
        }
        this.nodes.splice(this.nodes.indexOf(oldNode), 1);
    }

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
 
}
function prepareMatrixG(circuit) {
    let activeNodesCount=circuit.nodes.length-1;
    let matrixG = createMatrix(activeNodesCount, activeNodesCount);
    matrixG.forEach(element => {
        console.log(element);
    });

    for (let node of circuit.nodes) {
        if(node.number === -1) continue;
       for (let component of node.components) {
            if ((component.getResistance() === undefined) || (!component.minusNode   || !component.plusNode  || (component instanceof VoltageSource)) )  continue;
            matrixG[node.number][node.number] += 1 / Math.max(component.getResistance(), 0.000001);
        }
    }
    for (let component of circuit.components) {
        if (component.minusNode  && component.plusNode ) {
            if (component.minusNode .number === -1 || component.plusNode .number === -1 || (component instanceof VoltageSource)) continue;
            matrixG[component.minusNode .number][component.plusNode .number] -= 1 / Math.max(component.getResistance(), 0.000001);
            matrixG[component.plusNode .number][component.minusNode .number] -= 1 / Math.max(component.getResistance(), 0.000001);
        }
    }

    return matrixG;
}
function prepareMatrixB(circuit) {
    let activeNodes = circuit.nodes.length - 1;
    let cols = circuit.voltageSources.length;
    let matrixB = createMatrix(activeNodes, cols);

    for (let source of circuit.voltageSources) {
        let index = circuit.voltageSources.indexOf(source);

        if (source.minusNode  && source.minusNode .number !== -1 && source.minusNode .number < activeNodes) {
            matrixB[source.minusNode .number][index] = -1;
        }
        if (source.plusNode  && source.plusNode .number !== -1 && source.plusNode .number < activeNodes) {
            matrixB[source.plusNode .number][index] = 1;
        }
    }
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
    let matrixAsize = matrixG.length + matrixB[0].length;
    let matrixA = createMatrix(matrixAsize, matrixAsize);
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

    for(let i =0; i<circuit.voltageSources.length; i++){
        let source = circuit.voltageSources[i];
        if(!source.minusNode || !source.plusNode ){
            matrixA[ matrixG.length + i][matrixG.length + i] = 1;
        }

   
}
 return matrixA;
}
function prepareMatrixX(circuit) {
    matrixX = createMatrix(circuit.nodes.length + circuit.voltageSources.length, 1);

}
function prepareMatrixZ(circuit) {
    let activeNodes = circuit.nodes.length - 1;
    let matrixZ = createMatrix(activeNodes + circuit.voltageSources.length, 1);
    
    // Fill the Z matrix. The first 'activeNodes' rows remain 0.
    for (let i = 0; i < circuit.voltageSources.length; i++) {
        let source = circuit.voltageSources[i];
        if(!source.minusNode  || !source.plusNode ){
            matrixZ[activeNodes + i][0] = 0;
        } else {

        matrixZ[activeNodes + i][0] = source.getVoltage();
        }
    }
    
    return matrixZ;
}
function multiplyMatrixByMatrix(matrix1, matrix2) {
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

function matrix_invert(M) {
    const n = M.length;
    console.log("Inverting matrix of size " + n + "x" + M[0].length);
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
        console.log("Pivoting: max pivot in column " + i + " is " + maxVal + " at row " + maxRow);
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
    let matrixA = prepareMatrixA(circuit);
    let matrixZ = prepareMatrixZ(circuit);
    const Ainv = matrix_invert(matrixA);
    let matrixI = multiplyMatrixByMatrix(Ainv, matrixZ);
    
    let activeNodes = circuit.nodes.length - 1;

    circuit.components.forEach(component => {
         if(component.minusNode  === null || component.plusNode  === null) {
                console.log("Component " + component.getName() + " is not fully connected. Skipping voltage and current calculation.");
                return;
            }
        if(component instanceof VoltageSource) {
            
            component.setCurrent(matrixI[activeNodes + component.number][0]);
        } else {
           
            let voltage = 0;
            if (component.minusNode  && component.minusNode .number !== -1) {
                voltage -= matrixI[component.minusNode .number][0];
            }
            if (component.plusNode  && component.plusNode .number !== -1) {
                voltage += matrixI[component.plusNode .number][0];
            }
            component.setVoltage(voltage);
            component.setCurrent(voltage / component.getResistance());
        }
        console.log("Component: " + component.getName() + ", Voltage: " + component.getVoltage() + " Volts, Current: " + component.getCurrent() + " Amps");
    });

    return matrixI;
}