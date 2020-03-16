
import { encrypt } from './crypto.js'
import { BASE32, range } from './common.js'
import Image from './image.js'
 
const empty10 = [
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
    [,,,,,,,,,,],
]
const heart5 = [
    [  , 0,  , 0,  ,],
    [ 0, 0, 0, 0, 0,],
    [ 0, 0, 0, 0, 0,],
    [  , 0, 0, 0,  ,],
    [  ,  , 0,  ,  ,]
]

const image = new Image(heart5)

const n = image.size()
const pentaArray = new Uint8Array(n**2/5) // will store 5 pix in each byte
range(n).forEach((j) => {
    range(n).forEach((i) => {
        const ii = j*n/5 + (i-i%5)/5
        pentaArray[ii] <<= 1
        if (image.get(i, j)) {
            pentaArray[ii]++
        }
    })
}) // just serialize the 2d 1bit array to 1d array of 5bit vals


const hardwork = (i, step, targets) => {
    let lens = new Array(targets.length).fill(1)
    let KEY_SEED = i
    for(;;) {
        KEY_SEED += step
        
        const CODE = encrypt([...pentaArray], n/5, KEY_SEED)
            .map(v => BASE32[v]) 
            .join('') 
        
        if (
            targets.some((target, i) =>
                CODE.startsWith(target.substr(0, lens[i])) && ++lens[i]
            )
        ) {
            console.log(CODE, KEY_SEED)
        }
        if (KEY_SEED > 2**32) {
            console.log('end')
            break
        }
    }
}

addEventListener('message', ({data: {n, i, targets}}) => {
    console.log(`worker ${i}/${n} started`)
    postMessage('Hi!')

    hardwork(i, n, targets)

    console.log(`worker ${i}/${n} finished`)
})

console.log('worker initialized')