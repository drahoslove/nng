import { range, BASE32 } from './common.js'
import { encrypt, decrypt } from './crypto.js'


export default class Image {
    constructor(arg) {
        this.data = []
        if (typeof arg === 'number') {
            this.data = newImage(arg)
        }
        if (arg instanceof Array) {
            this.data = arg.map(row => [...row])
        }
    }
    
    static fromCode (code) {
        return new Image(decodeImage(code))
    }

    getData() {
        return this.data.map(row => [...row])
    }

    set(i, j, v) {
        setPix(this.data, i, j, v)
    }

    get(i, j) {
        return getPix(this.data, i, j)
    }

    size() {
        return this.data.length
    }

    toCode() {
        return encodeImage(this.data)
    }

    toString() {
        return sprintfImage(this.data)
    }

    getHints() {
        return getHints(this.data)
    }
    each(callback) {
        range(this.size()).forEach((j) => {
            range(this.size()).forEach((i) => {
                callback(i, j, this.get(i, j))
            })
        })
    }
}

const newImage = (n) => {
    if (n % 5) {
        throw Error("Bad image size - multiple of 5")
    }
    return range(n).map(() => new Array(n))
}

const setPix = (image, i, j, val) => {
    if (val === true) {
        image[j][i] = 0
        return
    }
    if (val === false) {
        delete image[j][i]
        return
    }
    image[j][i] = val
}

const getPix = (image, i, j) => {
    return i in image[j] && image[j][i] !== undefined
}

function encodeImage(image) {
    const n = image.length
    const pentaArray = new Uint8Array(n**2/5) // will store 5 pix in each byte
    range(n).forEach((j) => {
        range(n).forEach((i) => {
            const ii = j*n/5 + (i-i%5)/5
            pentaArray[ii] <<= 1
            if (getPix(image, i, j)) {
                pentaArray[ii]++
            }
        })
    }) // just serialize the 2d 1bit array to 1d array of 5bit vals

    return encrypt([...pentaArray], n/5)
        .map(v => BASE32[v]) // represent as base32 chars
        .join('') 
}

function decodeImage(imageString) {
    const n = Math.sqrt(imageString.length*5)
    if (n % 1 > 0) {
        throw Error('Bad image string - length must be (5*n)^2/5')
    }
    const image = newImage(n)
    
    const pentaArray = Uint8Array.from(
        decrypt(
            imageString
                .split('')
                .map(ch => BASE32.indexOf(ch)) // represent as 5bit values
        , n/5)
    )
    range(n).forEach((j) => {
        range(n).forEach((i) => {
            const v = pentaArray[j*n/5 + (i-i%5)/5]
            const bit = (v & (1<<(5-1-i%5)))
            setPix(image, i, j, bit > 0)
        })
    })
    return image
}


function sprintfImage(image) {
    return range(image.length).map(j =>
        range(image[j].length).map(i =>
            getPix(image, i, j) ? '[]' : '  '
        ).join('')
    ).join('\n')
}

function getHints(image) {
    let xHints = []
    let yHints = []
    const rng = range(image.length)

    rng.forEach((i) => {
        const xH = rng.reduce((xH, j) => {
            xH.push(getPix(image, j, i)
                ? (xH.pop()||0) + 1
                : 0
            )
            return xH
        }, []).filter(h=>h>0)
        const yH = rng.reduce((yH, j) => {
            yH.push(getPix(image, i, j)
                ? (yH.pop()||0) + 1
                :  0
            )
            return yH
        }, []).filter(h=>h>0)
        xHints.push(xH)
        yHints.push(yH)
    })

    return {
        xHints,
        yHints,
    }
}


// check 
const image = new Image([
    [ , 0,  , 0,  ,  ,  , 0, 0,  ,],
    [0, 0, 0,  , 0,  ,  , 0,  ,  ,],
    [0, 0, 0,  , 0,  ,  , 0,  ,  ,],
    [ , 0, 0,  ,  ,  ,  , 0,  ,  ,],
    [ ,  , 0,  ,  ,  ,  , 0,  ,  ,],
    [ , 0,  , 0,  ,  ,  , 0,  ,  ,],
    [0, 0, 0,  , 0,  ,  , 0,  ,  ,],
    [0, 0, 0,  , 0,  ,  , 0,  ,  ,],
    [ , 0, 0,  ,  ,  ,  , 0,  ,  ,],
    [ ,  , 0,  ,  ,  ,  , 0,  ,  ,],
])


if (image.toCode() !== Image.fromCode(image.toCode()).toCode()) {
    throw Error("bad decode")
}
