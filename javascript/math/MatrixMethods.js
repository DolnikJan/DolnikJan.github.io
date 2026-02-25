
export class MatrixMethods {
    static createMatrix(x, y) {
    let matrix = [];
    for (let i = 0; i < x; i++) {
        matrix[i] = [];
        for (let j = 0; j < y; j++) {
            matrix[i][j] = 0;
        }
    }
    return matrix;
}
    static matrix_invert(M) {
    const n = M.length;
    console.log("Inverting matrix of size " + n + "x" + M[0].length);
    if (n === 0 || M[0].length !== n) throw new Error("matrix must be square");

    // Create copies: C = M, I = identity
    const C = this.createMatrix(n, n);
    const I = this.createMatrix(n, n);
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
     static multiplyMatrixByMatrix(matrix1, matrix2) {
    let result = this.createMatrix(matrix1.length, matrix2[0].length);
    for (let i = 0; i < matrix1.length; i++) {
        for (let j = 0; j < matrix2[0].length; j++) {
            for (let k = 0; k < matrix1[0].length; k++) {
                result[i][j] += matrix1[i][k] * matrix2[k][j];
            }
        }
    }
    return result;
}
static transposeMatrix(matrix) {
    let transposed = this.createMatrix(matrix[0].length, matrix.length);
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            transposed[j][i] = matrix[i][j];
        }
    }
    return transposed;
}
}
