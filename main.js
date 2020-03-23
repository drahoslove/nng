import { range, BASE32 } from './common.js'
import Image from './image.js'

window.onhashchange = () => {
    location.reload()
}

const code = location.hash.substr(1)

let imageEdiable = code ? Image.fromCode(code) : new Image(10)
let imageTestable = new Image(imageEdiable.size())

const share = () => {
    window.prompt('', window.location.origin + `#${imageEdiable.toCode()}`)
}

const random = () => {
    const size = imageEdiable.size()
    const randomCode = range(size*size/5).map(i => (
        BASE32[Math.floor(Math.random()*32)]
    )).join('')
    window.location = window.location.origin + `#${randomCode}`
}

const isWin = () => {
    let win = true
    imageEdiable.each((i, j, val) => {
        if (val && !imageTestable.get(i, j)) {
            win = false
        }
    })
    return win
}


const LIVES = 5

let editor = new Vue({
    el: '#editor',
    data: () => ({
        visible: !code,
        imageData: imageEdiable.data,
        selSize: imageEdiable.size(),
    }),
    computed: {
        size () {
            return new Image(this.imageData).size()
        },
        hints () {
            return new Image(this.imageData).getHints()
        },
    },
    watch: {
        selSize (size, oldSize) {
            if (size !== oldSize) {
                imageEdiable = new Image(+size)
                this.imageData = imageEdiable.getData()
            }
        }
    },
    methods: {
        set (i, j, e) {
            if (e && e.buttons !== 1) {
                return
            }
            imageEdiable.set(i, j, true)
            this.imageData = imageEdiable.getData()
        },
        unset (i, j, e) {
            if (e && e.buttons !== 2) {
                return
            }
            imageEdiable.set(i, j, false)
            this.imageData =  imageEdiable.getData()
        },
        generate () {
            window.history.replaceState(null, null, `#${imageEdiable.toCode()}`)
            game.size = imageEdiable.size()
            game.hints = imageEdiable.getHints()
            imageTestable = new Image(imageEdiable.size())
            game.imageData = imageTestable.getData()
            game.lives = LIVES
            game.win = false
            game.visible = true
            this.visible = false
        },
        random,
        share,
    }
})

let game = new Vue({
    el: '#game',
    data: () => ({
        size: imageEdiable.size(),
        hints: imageEdiable.getHints(),
        imageData: imageTestable.getData(),
        lives: LIVES,
        visible: !!code,
        editable: !code,
        win: false,
    }),
    computed: {
        hearts() {
            return [...new Array(this.lives).fill('❤️'), ...new Array(LIVES-this.lives).fill('🖤')]
        }
    },
    methods: {
        set (i, j, e) {
            if (this.lives === 0) {
                return
            }
            if (e && e.buttons !== 1) {
                return 
            }
            if (imageTestable.get(i, j)) { // already touched
                return
            }
            if (imageEdiable.get(i, j)) {
                imageTestable.set(i, j, 0)
            } else {
                console.warn('chyba', i, j)
                this.lives--
                imageTestable.set(i, j, 1)
            }
            this.imageData = imageTestable.getData()
            this.win = isWin()
        },
        mark (i, j, e) {
            if (this.lives === 0) {
                return
            }
            if (e && e.buttons !== 2) {
                return 
            }
            if (imageTestable.get(i, j)) { // already touched
                return
            }
            if (!imageEdiable.get(i, j)) {
                imageTestable.set(i, j, 1)
            } else {
                console.warn('chyba', i, j)
                this.lives--
                imageTestable.set(i, j, 0)
            }
            this.imageData = imageTestable.getData()
        },
        reset () {
            imageTestable = new Image(imageEdiable.size())
            this.imageData = imageTestable.getData()
            this.lives = LIVES
            this.win = false
        },
        edit () {
            if (!code) {
                this.visible = false
                editor.visible = true
            }
        },
        home () {
            window.location = window.location.origin
        },
        share,
        random,
    }
})




console.log(imageEdiable.toString())
console.log(imageEdiable.toCode())



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
