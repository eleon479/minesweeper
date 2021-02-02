const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.redirect('minesweeper.html');
})

app.use(express.static('public'))

app.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)
})
