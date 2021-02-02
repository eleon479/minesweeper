const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.redirect('minesweeper.html');
})

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
