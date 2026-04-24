class App {
    constructor (row, col, vp_frac) {
        this.row = row
        this.col = col
        this.vp_frac = vp_frac

        this.grid = document.getElementById("grid")
        this.grid_state = []
        this.items = []
        
        this.row_selector = document.getElementById("row")
        this.col_selector = document.getElementById("column")
        
        this.playing = false

        this.back_btn = document.getElementById("back_btn")
        this.fordward_btn = document.getElementById("fordward_btn")
        this.toggle_btn = document.getElementById("toggle_btn")

        this.play_icon = document.getElementById("play_icon")
        this.pause_icon = document.getElementById("pause_icon")

        this.update_cycle = setInterval(
            () => {
                if (this.playing){
                    this.update()
                }
            },
            500
        )
    }

    init() {
        this.populate_grid(this.row, this.col, this.vp_frac)

        this.row_selector.addEventListener(
            "input",
            (event) => {
                let value = parseInt(event.target.value)

                if (value && value <= 999 && value >= 0) {
                    this.row_selector.value = value
                } else {
                    this.row_selector.value = 0
                }
            }
        )
        
        this.col_selector.addEventListener(
            "input",
            (event) => {
                let value = parseInt(event.target.value)

                if (value && value <= 999 && value >= 0) {
                    this.col_selector.value = value
                } else {
                    this.col_selector.value = 0
                }
            }
        )

        this.toggle_btn.addEventListener(
            "click",
            () => {
                if (this.playing){
                    this.play_icon.classList.remove("off")
                    this.pause_icon.classList.add("off")
                    this.toggle_btn.style.setProperty("--main-color", "#00ae00")
                } else {
                    this.pause_icon.classList.remove("off")
                    this.play_icon.classList.add("off")
                    this.toggle_btn.style.setProperty("--main-color", "#ae0000")
                }

                this.playing = !this.playing
            }
        )
    }

    update() {
        this.get_state()
        this.fordward_state()
        this.set_state()
    }

    populate_grid(row, col, vp_frac) {
        const cell_size = 100 * vp_frac / col
        
        this.grid.style.setProperty(
            'grid-template-columns',
            `repeat(${col}, ${cell_size}vw)`
        )
        
        this.grid.style.setProperty(
            'grid-template-rows',
            `repeat(${row}, ${cell_size}vw)`
        )

        this.items = Array.from(
            {length: row},
            () => Array.from(
                {length: col},
                () => document.createElement("div")
            )
        );

        this.grid_state = Array.from(
            {length: row},
            () => Array.from(
                {length: col},
                () => false
            )
        );

        for (const row of this.items) {
            for (const cell of row) {
                cell.classList.add("cell")
                cell.addEventListener(
                    'click',
                    () => {
                      cell.classList.toggle('on')  
                    }
                )
                this.grid.appendChild(cell)
            }
        }
    }

    free_grid() {
        for (const row of this.items) {
            for (const cell of row) {
                this.grid.removeChild(cell)
            }
        }
    }

    get_state() {
        for (let i = 0; i < this.items.length; i++) {
            const row = this.items[i];
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];   
                this.grid_state[i][j] = cell.classList.contains("on")  
            }
        }
    }    
    
    set_state() {
        for (let i = 0; i < this.items.length; i++) {
            const row = this.items[i];
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];   
                if(this.grid_state[i][j]) {
                    cell.classList.add("on")
                    continue
                }
                cell.classList.remove("on")
            }
        }
    }

    fordward_state(){
        const cur = this.grid_state
        const n = this.grid_state.length;
        const m = this.grid_state[0].length;

        const next = Array.from(
            {length: n},
            () => Array.from(
                {length: m},
                () => false
            )
        );
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                let num = 0
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        const x_bounded = (0 <= i + x) && (i + x < n)
                        const y_bounded = (0 <= j + y) && (j + y < m)
                        const middle = (x == 0) && (y == 0)
                        if(x_bounded && y_bounded && !middle && cur[i + x][j + y]) {
                            num++;
                        }
                    }
                }

                if (num == 3){
                    next[i][j] = true
                } else if (num == 2) {
                    next[i][j] = cur[i][j]
                } else {
                    next[i][j] = false
                }
            }
        }
        this.grid_state = next
    }
}

const app = new App(15, 15, 0.6);
app.init()