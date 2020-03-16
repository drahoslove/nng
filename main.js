import { range } from './common.js'
import Image from './image.js'

window.onhashchange = () => {
    location.reload()
}

const code = location.hash.substr(1)

let image = code
    ? Image.fromCode(code)
    : new Image(10)

let app = new Vue({
    el: '#app',
    data: () => ({
        imageData: image.data,
    }),
    computed: {
        size: function () {
            return new Image(this.imageData).size()
        },
        hints: function () {
            return new Image(this.imageData).getHints()
        },
    },
    methods: {
        set: function (i, j, e) {
            if (e && e.buttons !== 1) {
                return
            }
            image.set(i, j, true)
            this.imageData = image.getData()
            window.history.replaceState(null, null, `#${image.toCode()}`)
        },
        unset: function (i, j, e) {
            if (e && e.buttons !== 2) {
                return
            }
            image.set(i, j, false)
            this.imageData =  image.getData()
            window.history.replaceState(null, null, `#${image.toCode()}`)
        }
    }
})

let tools = new Vue({
    el: '#tools',
    data: {
        size: image.size(),
    },
    watch: {
        size: function(size, oldSize) {
            if (size !== oldSize) {
                image = new Image(+size)
                app.imageData = image.getData()
            }
        }
    },
})

// console.log(Image.fromCode(new Array(15*15/5).fill('A').join('')))
// console.log(Image.fromCode(new Array(15*15/5).fill('A').join('').slice(0,-1)+'B'))

console.log(image.toString())
console.log(image.toCode())
console.log(Image.fromCode(image.toCode()).toString())
console.log(Image.fromCode(image.toCode()).toCode())


const hints = image.getHints()

console.log('hints', hints)



function findEgg(targets, threads=8) {
    const workers = range(threads).map((i) => {
        const worker = new Worker('./eggworker-bundle.js', { type: 'classic' })
        return worker
    })
    const n = threads

    workers.forEach((worker, i) => {
        worker.postMessage({ n, i, targets })
    })
} 

window.findEgg = findEgg
