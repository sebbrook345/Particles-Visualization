export const create = dimension => values => {
    if (dimension === 2) {
        if (!values) {
            return [0, 0]
        }
        return [values[0] || 0, values[1] || 0]
    }

    if (dimension === 3) {
        if (!values) {
            return [0, 0, 0]
        }
        return [values[0] || 0, values[1] || 0, values[2] || 0]
    }
}

export const add = (out, a, b) => {
    if (out.length === 2) {
        out[0] = a[0] + b[0]
        out[1] = a[1] + b[1]
    }

    if (out.length === 3) {
        out[0] = a[0] + b[0]
        out[1] = a[1] + b[1]
        out[2] = a[2] + b[2]
    }

    return out
}

export const mult = (out, v, s) => {
    if (out.length === 2) {
        out[0] = v[0] * s
        out[1] = v[1] * s
    }

    if (out.length === 3) {
        out[0] = v[0] * s
        out[1] = v[1] * s
        out[2] = v[2] * s
    }

    return out
}

export const copy = (v) => {
    return v.map(e => e)
}