import { range } from './common.js'

export const getRand = (x) => () => {
    let z = (x += 0x6D2B79F5)
    z = (z ^ (z >> 15)) * (z | 1)
    z ^= z + (z ^ (z >> 7)) * (z | 61)
    return z ^ (z >> 14);
}

export const shuffle = (array, seed=0) => {
    const rand = getRand(seed)
    for (let i = array.length - 1; i > 0; i--) {
        const j = rand() % array.length
        ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
}


const KEY_SEED = 136961366 // LOVEU
const SUB_SEED = 0
const CRYPT_LOOPS = 7
const SUB_TABLE = shuffle(range(32), SUB_SEED)

export const skew = (n) => (_, index, arr) => { // arr.length must be dividable by n
    const i = index%n
    const j = (index-i)/n
    return arr[j*n + (i+j)%n]
}

export const unskew = (n) => (_, index, arr) => { // arr.length must be dividable by n
    const i = index%n
    const j = (index-i)/n
    return arr[j*n + (i-j+n*j)%n]
}

export const mix = (n) => (_, i, arr) => {
    const l = arr.length
    const ii = (index, s) => {
        const i = index%n
        const j = (index-i)/n
        const jj = (j+s) % (l/n)
        return jj*n + i
    }
    return range(5)
        .reduce((sum, s) => sum + (arr[ii(i, s)] & 1<<s), 0)
}

export const unmix = (n) => (_, i, arr) => {
    const l = arr.length
    const ii = (index, s) => {
        const i = index%n
        const j = (index-i)/n
        const jj = (j+l-s) % (l/n)
        return jj*n + i
    }
    return range(5)
        .reduce((sum, s) => sum + (arr[ii(i, s)] & 1<<s), 0)
}


export const encrypt = (arr, rowlen, seed=KEY_SEED, times=CRYPT_LOOPS) => {
    const keys = range(times+1).map(i => getRand(seed+i))
    arr = arr.map(v => (v ^ keys[0]()) % 32)
    return range(times).reduce((arr, i) => (
        arr
            .map(v => SUB_TABLE[v])
            .map(skew(rowlen))
            .map(mix(rowlen))
            .map(v => (v ^ keys[i+1]()) % 32)
    ), arr)
}

export const decrypt = (arr, rowlen, seed=KEY_SEED, times=CRYPT_LOOPS) => {
    const keys = range(times+1).map(i => getRand(seed+i))
    arr = range(times).reduce((arr, i) => (
        arr
            .map(v => (v ^ keys[keys.length-1-i]()) % 32)
            .map(unmix(rowlen))
            .map(unskew(rowlen))
            .map(v => SUB_TABLE.indexOf(v))
    ), arr)
    return arr.map(v => (v ^ keys[0]()) % 32)
}

